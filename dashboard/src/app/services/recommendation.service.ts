import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Club } from '../models/club.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private baseUrl = 'http://localhost:8080/clubsync/club'; // Utilisez la même base URL que votre ClubService

  constructor(private http: HttpClient) {}

  getRecommendedClubs(userId: number, maxRecommendations: number = 3): Observable<Club[]> {
    return this.http.get<any[]>(`${this.baseUrl}/recommendations/${userId}?max=${maxRecommendations}`).pipe(
      map(clubs => clubs.map(club => ({
        id_club: club.club_id, // Correction du nom de propriété
        name: club.name,
        categorie: club.categorie,
        description: club.description,
        slogan: club.slogan,
        members: club.members,
        logo: club.logo
      } as Club)))
    );
  }
}