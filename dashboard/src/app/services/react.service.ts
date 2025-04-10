import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { React, ReactType } from 'app/models/React.model';

@Injectable({
  providedIn: 'root'
})
export class ReactService {
  private apiUrl = `http://localhost:8080/clubsync/api/reacts`;

  constructor(private http: HttpClient) { }

  
  addReact(react: React): Observable<React> {
    return this.http.post<React>(this.apiUrl, react);
  }

  removeReact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getReactsByPost(postId: number): Observable<React[]> {
    return this.http.get<React[]>(`${this.apiUrl}/post/${postId}`);
  }

  countReactsByType(postId: number, type: ReactType): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${postId}/${type}`);
  }

  updateReact(react: React): Observable<React> {
    return this.http.put<React>(`${this.apiUrl}`, react);
  }
}