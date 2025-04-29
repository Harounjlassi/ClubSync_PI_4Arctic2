import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Announcement } from '../models/announcement';
@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private readonly API_URL = 'http://localhost:8080/clubsync/announcements';

  constructor(private http: HttpClient) { }

// Dans announcement.service.ts


getAll(): Observable<Announcement[]> {
  return this.http.get<any[]>(`${this.API_URL}/all`).pipe(

    // 1. on transforme chaque raw en notre Announcement TS
    map(rawArr => rawArr.map(raw => ({
      id:        raw.id,
      title:     raw.title,
      content:   raw.content,
      createdAt: raw.createdAt,
      club:      raw.club,
      clubId:    raw.club?.id_club ?? 0        // ← on crée toujours ce champ
    }))),

    // 2. on loggue le résultat normalisé
    tap(normalized => console.log('✅ normalized announcements:', normalized)),

    // 3. en cas d’erreur on retourne un tableau vide
    catchError(error => {
      console.error('❌ Erreur getAll():', error);
      return of([]);
    })
  );
}

  getByClub(clubId: number): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.API_URL}/club/${clubId}`).pipe(
      catchError(this.handleError<Announcement[]>('getByClub', []))
    );
  }

  addAnnouncement(clubId: number, announcement: Announcement): Observable<Announcement> {
    return this.http.post<any>(`${this.API_URL}/add/${clubId}`, announcement).pipe(
      map(response => {
        // Normaliser la réponse
        const normalizedResponse = { ...response };
        
        // Traiter le format du club
        if (typeof normalizedResponse.club === 'number') {
          // Si club est un ID numérique, le transformer en objet
          normalizedResponse.clubId = normalizedResponse.club;
          normalizedResponse.club = { 
            id_club: normalizedResponse.club,
            name: this.getClubNameById(clubId)
          };
        } else if (normalizedResponse.club && normalizedResponse.club.id_club) {
          // Si club est un objet, extraire l'ID
          normalizedResponse.clubId = normalizedResponse.club.id_club;
        }
        
        return normalizedResponse;
      }),
      catchError(this.handleError<Announcement>('addAnnouncement'))
    );
  }
  
  // Méthode auxiliaire pour obtenir le nom du club par ID
  private getClubNameById(clubId: number): string {
    // Vous pourriez avoir une liste de clubs en cache ou faire une requête séparée
    // Pour l'instant, nous retournons un nom générique
    return `Club #${clubId}`;
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
