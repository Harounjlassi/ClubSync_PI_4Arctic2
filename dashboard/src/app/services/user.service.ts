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
import { mapUserResponseToUser } from '../mappers/user-mapper.service';

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
  register(userRequest: any): Observable<any> {
    // Create a FormData object to send multipart/form-data
    const formData = new FormData();
    
    // Convert user object to JSON string and add as "userRequest" part
    const userRequestJson = JSON.stringify({
      firstname: userRequest.firstname,
      lastname: userRequest.lastname,
      email: userRequest.email,
      password: userRequest.password,
      dateNaissance: userRequest.dateNaissance,
      sexe: userRequest.sexe,
      numeroDeTelephone: userRequest.numeroDeTelephone,
      id_role: userRequest.id_role
    });
    
    // Add the JSON string as a part named "userRequest"
    formData.append('userRequest', userRequestJson);
    
    // Add the photo file if it exists
    if (userRequest.photoProfil && typeof userRequest.photoProfil === 'object') {
      formData.append('photo', userRequest.photoProfil);
    }
    
    return this.http.post<any>(`${this.authUrl}/registration`, formData).pipe(
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
    getAllUsers(): Observable<User[]> {
      return this.http.get<any>(`${this.apiUrl}/get/all`).pipe(
        tap(rawResponse => console.log('Raw API response:', rawResponse)),
        map(response => {
          // Vérifiez si la réponse est un tableau ou un objet contenant un tableau
          if (Array.isArray(response)) {
            return response;
          } else if (response && typeof response === 'object') {
            // Peut-être que votre API renvoie { data: [...] } ou un format similaire
            const users = response.data || response.users || response.content;
            if (users) return users;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching users:', error);
          return [];
        })
      );
    }
  
     getUserById(id: number): Observable<UserResponse> {
      return this.http.get<UserResponse>(`${this.apiUrl}/get/${id}`).pipe(
         catchError(this.handleError)
       );
      
     }
  
    updateUser(id: number, formData: FormData): Observable<any> {
      // Don't set Content-Type manually, let the browser set it with the boundary
      return this.http.put(`${this.apiUrl}/update/${id}`, formData);
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
   /* verifyCode(verifyRequest: { email: string, code: string }): Observable<any> {
      return this.http.post<any>(`${this.authUrl}/verify-code`, verifyRequest).pipe(
        catchError(this.handleError)
      );
    }*/
  
    getUserInfo(): Observable<any> {
      return this.http.get<any>(`${this.authUrl}/me`, {
        headers: this.getAuthHeaders()
      }).pipe(
        catchError(error => {
          console.error('An error occurred:', error);
          return throwError(() => error);
        })
      );
    }
    private getAuthHeaders(): HttpHeaders {
      const token = this.storageService.getToken();
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    forgotPassword(email: string): Observable<any> {
      return this.http.post(`${this.authUrl}/forgot-password`, { email });
    }
  
    verifyCode(email: string, code: string): Observable<any> {
      return this.http.post(`${this.authUrl}/verify-code`, { email, code });
    }
  
    resetPassword(email: string, token: string, newPassword: string): Observable<any> {
      return this.http.post(`${this.authUrl}/reset-password`, { 
        email, 
        token, 
        newPassword 
      });
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
      const token = this.storageService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    
      // Specify responseType as 'text' instead of the default 'json'
      return this.http.post(`${this.authUrl}/logout`, {}, { 
        headers, 
        responseType: 'text' 
      }).pipe(
        tap(() => {
          this._isLoggedIn$.next(false);
          this.storageService.clean();
        }),
        catchError(error => {
          console.error('Logout error:', error);
          return throwError(() => error);
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
      findUserId(id: number): Observable<User> {

    //http://localhost:8080/api/reports/search/findByProjetId?id=1&page=0&size=10
    const repUrl = `${this.apiUrl}/getUserById/${id}`;

    return this.http.get<User>(repUrl).pipe(
      map((response) => {
        console.log("API Response getUserById:", response);
        return response;
      }),
      catchError((error) => {
        console.error("API Error:", error);
        return throwError(() => new Error(error.message || "API Error"));
      })
    );
  }
  
}