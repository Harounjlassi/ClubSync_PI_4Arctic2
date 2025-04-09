import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Club } from '../models/club.model';

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private baseUrl = 'http://localhost:8080/clubsync/club'; // Ajout de /clubsync

  constructor(private http: HttpClient) {}

  getAllClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.baseUrl}/retrieveAllClub`);
  }

  getClubById(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.baseUrl}/retrieveClub/${id}`);
  }

  addClub(club: Club): Observable<Club> {
    return this.http.post<Club>(`${this.baseUrl}/AddClub`, club);
  }

  updateClub(club: Club): Observable<Club> {
    return this.http.put<Club>(`${this.baseUrl}/updateClub`, club);
  }

  deleteClub(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteClub/${id}`);
  }

   // Club members methods
   getClubMembers(clubId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${clubId}/members`);
  }

  addMemberToClub(clubId: number, userId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${clubId}/addMember/${userId}`, {});
  }

  removeMemberFromClub(clubId: number, userId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${clubId}/removeMember/${userId}`);
  }


}
