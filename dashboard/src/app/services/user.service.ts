import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  private authUrl = 'http://localhost:8080/clubsync/auth'; ;

  constructor(private http: HttpClient, private storageService: StorageService) { }

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
    return this.http.post<any>(`${this.authUrl}/login`, loginRequest);
  }

  verifyCode(verifyRequest: { email: string, code: string }): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/verify-code`, verifyRequest);
  }

  getUserInfo(): Observable<any> {
    return this.http.get<any>(`${this.authUrl}/me`);
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/logout`, {});
  }  // Fixed the URL path by adding a separator
  getUserBoard(): Observable<any> {
    return this.http.get(`${this.authUrl}/test-comps`, { responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(`${this.authUrl}/dashboard`, { responseType: 'text' });
  }
}