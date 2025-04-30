import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Request } from '../models/request';
import { Observable, tap } from 'rxjs';
import { NgModule } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = 'http://localhost:8080/clubsync/book-requests';
  constructor(private http: HttpClient) { }

  createRequest(request: Request): Observable<Request> {
    console.log('Creating requestddddddd:', request);
    return this.http.post<Request>(this.apiUrl, request);
  }

  getRequests(status: string = 'PENDING'): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}?status=${status}`);
  }

  getUserRequests(userId: number): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/user/${userId}`);
  }
  updateRequestStatus(id: number, status: string, feedback?: string): Observable<Request> {
    console.log(`Updating request ${id} to status ${status}`);
    
    let url = `${this.apiUrl}/${id}/status`;
    const params = new HttpParams()
      .set('status', status)
      .set('feedback', feedback || '');
  
    return this.http.patch<Request>(url, {}, { params }).pipe(
      tap({
        next: (response) => console.log('Update response:', response),
        error: (err) => console.error('Update error:', err)
      })
    );
  }}