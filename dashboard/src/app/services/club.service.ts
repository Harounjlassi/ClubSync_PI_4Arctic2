import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Club } from '../models/club.model';
import { User } from 'app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private baseUrl = 'http://localhost:8080/clubsync/club'; // Ajout de /clubsync

  constructor(private http: HttpClient) {}

  private clubUpdateSubject = new BehaviorSubject<void>(null);



  getAllClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.baseUrl}/retrieveAllClub`).pipe(
      switchMap(clubs => {
        // If there are no clubs, return empty array
        if (!clubs || clubs.length === 0) {
          return of([]);
        }
        
        // Create an array of observables for fetching members for each club
        const clubsWithMembers$ = clubs.map(club => {
          if (!club.id_club) {
            club.members = [];
            return of(club);
          }
          
          // Fetch members for this club
          return this.getClubMembers(club.id_club).pipe(
            map(members => {
              // Assign members to the club
              club.members = members;
              return club;
            }),
            catchError(() => {
              // If there's an error fetching members, just set an empty array
              club.members = [];
              return of(club);
            })
          );
        });
        
        // Wait for all clubs to have their members fetched
        return forkJoin(clubsWithMembers$);
      })
    );
  }

  getClubById(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.baseUrl}/retrieveClub/${id}`).pipe(
      switchMap(club => {
        if (!club) {
          return of(null);
        }
        // Fetch members for this club
        return this.getClubMembers(id).pipe(
          map(members => {
            club.members = members;
            return club;
          }),
          catchError(() => {
            club.members = [];
            return of(club);
          })
        );
      })
    );
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
    return this.http.get<User[]>(`${this.baseUrl}/${clubId}/members`);
  }

  addMemberToClub(clubId: number, userId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${clubId}/addMember/${userId}`, {});
  }

  removeMemberFromClub(clubId: number, userId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${clubId}/removeMember/${userId}`);
  }

  // Ajoutez cette méthode pour récupérer les clubs d'un utilisateur
getClubsByUser(userId: number): Observable<Club[]> {
  return this.http.get<Club[]>(`${this.baseUrl}/retrieveClubsByUser/${userId}`).pipe(
    catchError(error => {
      console.error('Error fetching user clubs:', error);
      return of([]);
    })
  );
}


// Méthode pour notifier les changements
notifyClubUpdate() {
  this.clubUpdateSubject.next();
}

// Observable pour écouter les mises à jour
get clubUpdates$() {
  return this.clubUpdateSubject.asObservable();
}


}
