import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Announcement } from '../models/announcement';
@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private readonly API_URL = 'http://localhost:8080/clubsync/announcements';

  constructor(private http: HttpClient) { }

// Dans announcement.service.ts
getAll(): Observable<Announcement[]> {
  return this.http.get<Announcement[]>(`${this.API_URL}/all`).pipe(
    tap(data => console.log('Réponse API:', data)), // Debug
    catchError(this.handleError<Announcement[]>('getAll', []))
  );
}

  getByClub(clubId: number): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.API_URL}/club/${clubId}`).pipe(
      catchError(this.handleError<Announcement[]>('getByClub', []))
    );
  }

  addAnnouncement(clubId: number, announcement: Announcement): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.API_URL}/add/${clubId}`, announcement).pipe(
      catchError(this.handleError<Announcement>('addAnnouncement'))
    );
  }

  deleteAnnouncement(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError<any>('deleteAnnouncement'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`Erreur pendant ${operation}:`, error);
      return of(result as T);
    };
    
  }
  updateAnnouncement(id: number, announcement: Announcement, clubId?: number): Observable<Announcement> {
    const url = clubId 
      ? `${this.API_URL}/update/${id}/${clubId}`
      : `${this.API_URL}/update/${id}`;
      
    return this.http.put<Announcement>(url, announcement).pipe(
      catchError(this.handleError<Announcement>('updateAnnouncement'))
    );
  }
  
}
