import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserRequest } from '../models/user-request.model';
import { UserResponse } from '../models/user-response.model';
import { UserStatsResponse } from '../models/user-stats-response.model';
import { StorageService } from './storage.service';
import { jwtDecode } from 'jwt-decode';
import { Role, RoleType } from '../models/role.model';

interface DecodedToken {
  role?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  sub?: string;
  birthDate?: number;
  gender?: string;
  phoneNumber?: string;
  profilePicture?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/clubsync/user';
  private authUrl = 'http://localhost:8080/clubsync/auth';
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn$.asObservable();
  user: User | null = null;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.storageService.getToken();
    this._isLoggedIn$.next(!!token);
    if (token) {
      const user = this.storageService.getUser();
      this.user = user ? this.mapToUser(user) : null;
    }
  }
    // Authentication methods
    register(userRequest: UserRequest): Observable<any> {
      return this.http.post<any>(`${this.authUrl}/registration`, userRequest).pipe(
        catchError(this.handleError)
      );
    }

  private mapToUser(data: any): User {
    return {
      firstname: data.firstName || data.firstname || '',
      lastname: data.lastName || data.lastname || '',
      email: data.email || data.sub || '',
      dateNaissance: data.birthDate ? new Date(data.birthDate) : 
                   (data.dateNaissance ? new Date(data.dateNaissance) : null),
      sexe: data.gender || data.sexe || '',
      numeroDeTelephone: data.phoneNumber || data.numeroDeTelephone || null,
      photoProfil: data.profilePicture || data.photoProfil || null,
      role: this.normalizeRole(data.role),
      archived: data.isArchived || false
    };
  }

  private normalizeRole(role: any): Role {
    if (!role) return RoleType.USER as unknown as Role;
    if (typeof role === 'string') return role.toUpperCase() as unknown as Role;
    if (role.roleType) return role.roleType.toUpperCase() as unknown as Role;
    return RoleType.USER as unknown as Role;
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  login(loginRequest: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, loginRequest).pipe(
      tap((response: any) => {
        console.log('Login response:', response);
  
        const responseRole = response.role;
        const tokenRole = this.decodeToken(response.token)?.role;
        const finalRole = responseRole || tokenRole || RoleType.USER;
  
        const user = this.mapToUser({
          ...response.user,
          role: finalRole
        });
  
        this.storageService.saveAuthData({
          token: response.token,
          user: user
        });
  
        this._isLoggedIn$.next(true);
        this.user = user;
      }),
      catchError(error => {
        if (error.status === 403 && error.error?.includes("Account is banned")) {
          return throwError(() => new Error("Your account is banned. Please contact the admin."));
        } else if (error.status === 401) {
          return throwError(() => new Error("Invalid credentials. Please check your email and password."));
        }
        return this.handleError(error);
      })
    );
  }

  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/google`, { idToken }).pipe(
      tap((response: any) => {
        const decoded = this.decodeToken(response.token);
        if (decoded) {
          const user = this.mapToUser({
            ...decoded,
            role: decoded.role || response.role || RoleType.USER
          });
          
          this.storageService.saveAuthData({
            token: response.token,
            user: user
          });
          
          this._isLoggedIn$.next(true);
          this.user = user;
        }
      }),
      catchError(this.handleError)
    );
  }

  // ... (keep all other existing methods unchanged) ...
    // CRUD Operations
    getAllUsers(): Observable<UserResponse[]> {
      console.log('Making API call to:', `${this.apiUrl}/get/all`);
      
      return this.http.get<UserResponse[]>(`${this.apiUrl}/get/all`)
        .pipe(
          tap(response => {
            console.log('Raw API response:', response);
            console.log('Response type:', typeof response);
            if (Array.isArray(response)) {
              console.log('Is array with length:', response.length);
              if (response.length > 0) {
                console.log('First item sample:', response[0]);
              }
            }
          }),
          catchError(error => {
            console.error('API error details:', error);
            return this.handleError(error);
          })
        );
    }
  
    getUserById(id: number): Observable<UserResponse> {
      return this.http.get<UserResponse>(`${this.apiUrl}/get/${id}`).pipe(
        catchError(this.handleError)
      );
    }
  
    updateUser(id: number, userRequest: UserRequest): Observable<UserResponse> {
      return this.http.put<UserResponse>(`${this.apiUrl}/update/${id}`, userRequest).pipe(
        catchError(this.handleError)
      );
    }
  
    deleteUser(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
        catchError(this.handleError)
      );
    }
  
    // Archive/Restore operations
    archiveUser(id: number): Observable<void> {
      return this.http.put<void>(`${this.apiUrl}/archive/${id}`, {}).pipe(
        catchError(this.handleError)
      );
    }
  
    restoreUser(id: number): Observable<string> {
      return this.http.put<string>(`${this.apiUrl}/restore/${id}`, {}).pipe(
        catchError(this.handleError)
      );
    }
  
    // Filtering and pagination
    filterByField(field: string, value: string): Observable<UserResponse[]> {
      return this.http.get<UserResponse[]>(`${this.apiUrl}/filter`, {
        params: new HttpParams()
          .set('field', field)
          .set('value', value)
      }).pipe(
        catchError(this.handleError)
      );
    }
  
    getUsersSortedByPrenom(page: number = 0, size: number = 10): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/users/sorted`, {
        params: new HttpParams()
          .set('page', page.toString())
          .set('size', size.toString())
      }).pipe(
        catchError(this.handleError)
      );
    }
  
    // Statistics
    getUserStats(): Observable<UserStatsResponse> {
      return this.http.get<UserStatsResponse>(`${this.apiUrl}/users/stats`).pipe(
        catchError(this.handleError)
      );
    }
  
    // Auth related
    isEmailTaken(email: string): Observable<boolean> {
      return this.http.get<{ taken: boolean }>(`${this.apiUrl}/users/check-email`, {
        params: new HttpParams().set('email', email)
      }).pipe(
        map(response => response.taken),
        catchError(this.handleError)
      );
    }
    verifyCode(verifyRequest: { email: string, code: string }): Observable<any> {
      return this.http.post<any>(`${this.authUrl}/verify-code`, verifyRequest).pipe(
        catchError(this.handleError)
      );
    }
  
    getUserInfo(): Observable<UserResponse> {
      // Ensure the Authorization header is included
      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.storageService.getToken()}`);
      
      return this.http.get<UserResponse>(`${this.authUrl}/me`, { headers }).pipe(
        map(userData => new UserResponse(userData)), // Use the constructor to normalize the data
        tap(user => {
          // Store the user data for future use
          this.storageService.saveAuthData({
            token: this.storageService.getToken() || '',
            user: user
          });
        }),
        catchError(this.handleError)
      );
    }
    getUserId(): number | null {
      const token = this.storageService.getToken();
      if (!token) return null;
    
      const decoded = this.decodeToken(token);
      if (decoded && decoded.sub) {
        return Number(decoded.sub);
      }
      return null;
    }
  
    logout(): Observable<any> {
      return this.http.post<any>(`${this.authUrl}/logout`, {}).pipe(
        tap(() => {
          this.clearAuthState();
        }),
        catchError(error => {
          this.clearAuthState();
          return throwError(error);
        })
      );
    }
  
    getUserBoard(): Observable<any> {
      return this.http.get(`${this.authUrl}/User`, { 
        headers: new HttpHeaders().set('Authorization', `Bearer ${this.storageService.getToken()}`),
        responseType: 'text' 
      }).pipe(
        catchError(this.handleError)
      );
    }
  
    getAdminBoard(): Observable<any> {
      return this.http.get(`${this.authUrl}/dashboard`, { 
        withCredentials: true, 
        responseType: 'text' 
      }).pipe(
        catchError(this.handleError)
      );
    }
  
    private clearAuthState(): void {
      this.storageService.clean();
      this._isLoggedIn$.next(false);
      this.user = null;
    }

  isAdmin(): boolean {
    const user = this.user || this.storageService.getUser();
    if (!user) return false;
    
    const role = this.normalizeRole(user.role);
    return role.roleType === RoleType.ADMIN;
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
  loginWithFace(imageBlob: Blob, email: string): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageBlob, 'face-login.jpg');
    formData.append('email', email); // Add email to the form data
    
    return this.http.post<any>(`${this.authUrl}/face-login`, formData).pipe(
      tap((response: any) => {
        if (response && response.token) {
          const user = this.mapToUser({
            ...response,
            role: response.role || RoleType.USER
          });
          
          this.storageService.saveAuthData({
            token: response.token,
            user: user
          });
          
          this._isLoggedIn$.next(true);
          this.user = user;
        }
      }),
      catchError(this.handleError)
    );
  }
  
  // 3. Add a method to validate if a user's face is enrolled
  // This can be useful to check if face login is available for the user
  checkFaceEnrollment(email: string): Observable<any> {
    return this.http.get<any>(`${this.authUrl}/check-face-enrollment/${email}`).pipe(
      catchError(this.handleError)
    );
  }
  
  // Also add this method for face registration that might be useful in the future
  registerFace(imageBlob: Blob, email: string): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageBlob, 'face-register.jpg');
    formData.append('email', email);
    
    return this.http.post<any>(`${this.authUrl}/register-with-face`, formData).pipe(
      catchError(this.handleError)
    );
  }


  /// gestion projet 

  getUserByUsername(username: string): Observable<User[]> {
    //http://localhost:8080/api/reports/search/findByProjetId?id=1&page=0&size=10
    const repUrl = `${this.apiUrl}/searchUserByUsername/${username}`;

    return this.http.get<User[]>(repUrl).pipe(
      map((response) => {
        console.log("API Response:", response);
        return response;
      }),
      catchError((error) => {
        console.error("API Error:", error);
        return throwError(() => new Error(error.message || "API Error"));
      })
    );
  }

  // getUserById(id: number): Observable<User> {

  //   //http://localhost:8080/api/reports/search/findByProjetId?id=1&page=0&size=10
  //   const repUrl = `${this.baseUrl}/getUserById/${id}`;

  //   return this.httpClient.get<User>(repUrl).pipe(
  //     map((response) => {
  //       console.log("API Response getUserById:", response);
  //       return response;
  //     }),
  //     catchError((error) => {
  //       console.error("API Error:", error);
  //       return throwError(() => new Error(error.message || "API Error"));
  //     })
  //   );
  // }
}