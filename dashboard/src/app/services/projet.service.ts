import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Projet } from 'app/common/projet';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {

  constructor(private httpClient:HttpClient) { }
  //private baseUrl = 'http://localhost:8080/api/products?size=100';
  private baseUrl = 'http://localhost:8080/api/projet';
  getProjets(): Observable<Projet[]> {
    return this.httpClient.get<GetResponseProduct>(this.baseUrl).pipe(
      map(response => {
        console.log("API Response:", response);
        return response._embedded?.Projet || []; 
      }),
      catchError(error => {
        console.error("API Error:", error);
        return throwError(() => new Error(error.message || "API Error"));
      })
    );
  }
}
interface GetResponseProduct {
  _embedded: {
    Projet: Projet[];
  }

}