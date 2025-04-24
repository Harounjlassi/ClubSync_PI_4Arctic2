// face-recognition.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaceRecognitionService {
  private apiUrl = 'http://localhost:5000'; // Your Flask API URL

  constructor(private http: HttpClient) { }

  startCamera(): Observable<any> {
    return this.http.post(`${this.apiUrl}/start`, {});
  }

  detectFaces(): Observable<any> {
    return this.http.get(`${this.apiUrl}/detect`);
  }

  stopCamera(): Observable<any> {
    return this.http.post(`${this.apiUrl}/stop`, {});
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  addUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, userData);
  }
}