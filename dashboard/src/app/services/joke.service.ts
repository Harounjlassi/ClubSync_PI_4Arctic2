import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JokeService {
  private apiUrl = 'http://localhost:8080/clubsync/joke';

  constructor(private http: HttpClient) { }

  getJoke(language: string = 'fr'): Observable<string> {
    // Ajouter le paramètre de langue à la requête
    const params = new HttpParams().set('lang', language);
    return this.http.get(this.apiUrl, { params: params, responseType: 'text' });
  }
}