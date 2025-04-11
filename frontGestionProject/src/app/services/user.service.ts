import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'app/common/user';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

constructor(private httpClient: HttpClient) {}
  //private baseUrl = 'http://localhost:8080/api/products?size=100';
  private baseUrl = "http://localhost:8080/api/users";   $
  // 
  getUserByUsername(username: string): Observable<User[]> {
        //http://localhost:8080/api/reports/search/findByProjetId?id=1&page=0&size=10
        const repUrl = `${this.baseUrl}/searchUserByUsername/${username}`;
    
        return this.httpClient.get<User[]>(repUrl).pipe(
          map((response) => {
            console.log("API Response:", response);
            return response;
          }),
          catchError((error) => {
            console.error("API Error:", error);
            return throwError(() => new Error(error.message || "API Error"));
          })
        );
      }

      getUserById(id: number): Observable<User> {

        //http://localhost:8080/api/reports/search/findByProjetId?id=1&page=0&size=10
        const repUrl = `${this.baseUrl}/getUserById/${id}`;
    
        return this.httpClient.get<User>(repUrl).pipe(
          map((response) => {
            console.log("API Response getUserById:", response);
            return response;
          }),
          catchError((error) => {
            console.error("API Error:", error);
            return throwError(() => new Error(error.message || "API Error"));
          })
        );
      }
}
