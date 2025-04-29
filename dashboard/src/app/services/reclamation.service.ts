// src/app/shared/services/reclamation.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ReclamationRequest, 
  ReclamationResponse, 
  ReclamationResponseDTO 
} from '../models/reclamation.model';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private baseUrl = 'http://localhost:8080/clubsync/reclamations';

  constructor(private http: HttpClient) { }

  // Admin methods
  getAllReclamations(): Observable<ReclamationResponseDTO[]> {
    return this.http.get<ReclamationResponseDTO[]>(`${this.baseUrl}/getall`);
  }

  getReclamationById(id: number): Observable<ReclamationResponse> {
    return this.http.get<ReclamationResponse>(`${this.baseUrl}/get/${id}`);
  }

  updateReclamation(id: number, request: ReclamationRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, request);
  }

  archiveReclamation(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/archive/${id}`, {});
  }

  deleteReclamation(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  getArchivedReclamations(): Observable<ReclamationResponseDTO[]> {
    return this.http.get<ReclamationResponseDTO[]>(`${this.baseUrl}/archived`);
  }

  restoreReclamation(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/restore/${id}`, {});
  }

  // User methods
  createReclamation(request: ReclamationRequest): Observable<ReclamationResponse> {
    return this.http.post<ReclamationResponse>(`${this.baseUrl}/save`, request);
  }

  getUserReclamations(): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${this.baseUrl}/mes-reclamations`);
  }
}