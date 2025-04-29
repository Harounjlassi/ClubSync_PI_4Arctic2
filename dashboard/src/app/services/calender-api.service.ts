import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class CalenderApiService {

  private apiUrl = 'http://localhost:8080/clubsync'; 

  constructor(private http: HttpClient) { }

  initiateGoogleAuth(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/init-auth`, eventData, {
      observe: 'response',
      responseType: 'json'
    });
  }
  openAuthUrlInBrowser(url: string): void {
    window.open(url, '_blank');
  }
}