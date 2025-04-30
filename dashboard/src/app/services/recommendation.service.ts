import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { Club } from '../models/club.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private baseUrl = 'http://localhost:8080/clubsync/club';

  constructor(private http: HttpClient) {}

  getRecommendedClubs(userId: number, maxRecommendations: number = 3): Observable<Club[]> {
    return this.http.get<any[]>(`${this.baseUrl}/recommendations/${userId}?max=${maxRecommendations}`).pipe(
      map(response => {
        // Handle null/undefined response or non-array response
        if (!Array.isArray(response)) {
          return [];
        }
        
        return response.map(club => ({
          id_club: club.club_id,
          name: club.name,
          categorie: club.categorie,
          description: club.description,
          slogan: club.slogan,
          members: club.members,
          logo: club.logo
        } as Club));
      })
    );
  }
}