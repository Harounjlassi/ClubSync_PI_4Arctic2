import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserRequest } from '../models/user-request.model';
import { UserResponse } from '../models/user-response.model';
import { UserStatsResponse } from '../models/user-stats-response.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/clubsync/user';
  private authUrl = 'http://localhost:8080/clubsync/auth'; 
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private readonly TOKEN_NAME = 'user_auth';
  isLoggedIn$ = this._isLoggedIn$.asObservable();
  user: User | null;

  get token(): any {
    return localStorage.getItem(this.TOKEN_NAME);
  }

  constructor(private http: HttpClient, private storageService: StorageService) {
    this._isLoggedIn$.next(!!this.token);
    this.user = this.getUser(this.token);
  }
  
  private getUser(token: string): User | null {
    if (!token) {
      return null
    }
    return JSON.parse(atob(token.split('.')[1])) as User;
  }
  
  // CRUD Operations
  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/get/all`);
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/get/${id}`);
  }

  updateUser(id: number, userRequest: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/update/${id}`, userRequest);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Archive/Restore operations
  archiveUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/archive/${id}`, {});
  }

  restoreUser(id: number): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/restore/${id}`, {});
  }

  // Filtering and pagination
  filterByField(field: string, value: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/filter`, {
      params: new HttpParams()
        .set('field', field)
        .set('value', value)
    });
  }

  getUsersSortedByPrenom(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/sorted`, {
      params: new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
    });
  }

  // Statistics
  getUserStats(): Observable<UserStatsResponse> {
    return this.http.get<UserStatsResponse>(`${this.apiUrl}/users/stats`);
  }

  // Auth related
  isEmailTaken(email: string): Observable<boolean> {
    return this.http.get<{ taken: boolean }>(`${this.apiUrl}/users/check-email`, {
      params: new HttpParams().set('email', email)
    }).pipe(
      map(response => response.taken)
    );
  }

  // Authentication methods
  register(userRequest: UserRequest): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/registration`, userRequest);
  }

  login(loginRequest: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, loginRequest).pipe(
      tap((response: any) => {
        this._isLoggedIn$.next(true);
        localStorage.setItem(this.TOKEN_NAME, response.token);
        this.user = this.getUser(response.token);
      })
    );
  }
  
  // New method for Google authentication
  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/google`, { idToken }).pipe(
      tap((response: any) => {
        this._isLoggedIn$.next(true);
        localStorage.setItem(this.TOKEN_NAME, response.token);
        this.user = this.getUser(response.token);
      })
    );
  }

  verifyCode(verifyRequest: { email: string, code: string }): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/verify-code`, verifyRequest);
  }

  getUserInfo(): Observable<any> {
    return this.http.get<any>(`${this.authUrl}/me`);
  }

  logout(): Observable<any> {
    // Clear local storage on logout
    this._isLoggedIn$.next(false);
    localStorage.removeItem(this.TOKEN_NAME);
    this.user = null;
    
    return this.http.post<any>(`${this.authUrl}/logout`, {});
  }
  
  getUserBoard(): Observable<any> {
    const token = this.storageService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.authUrl}/User`, { headers, responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(`${this.authUrl}/dashboard`, { withCredentials: true, responseType: 'text' });
  }
}