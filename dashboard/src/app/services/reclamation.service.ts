import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  ReclamationRequest,
  ReclamationResponse,
  ReclamationResponseDTO
} from '../models/reclamation.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private baseUrl = 'http://localhost:8080/clubsync/reclamations';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  // Admin methods
  getAllReclamations(): Observable<ReclamationResponseDTO[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/getall`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.map(item => ({
        idReclamation: item.id,  // Changed from 'id' to 'idReclamation'
        nomUtilisateur: item.nomUtilisateur,
        typeReclamation: item.typeReclamation,
        description: item.description,
        statut: item.statut,
        dateReclamation: new Date(item.dateReclamation),
        dateResolution: item.dateResolution ? new Date(item.dateResolution) : null
      })))
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.storageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getReclamationById(id: number): Observable<ReclamationResponse> {
    return this.http.get<ReclamationResponse>(
      `${this.baseUrl}/get/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  updateReclamation(id: number, request: ReclamationRequest): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/update/${id}`, 
      request, 
      { headers: this.getHeaders() }
    );
  }

  archiveReclamation(id: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/archive/${id}`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  restoreReclamation(id: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/restore/${id}`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  deleteReclamation(id: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/delete/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  getArchivedReclamations(): Observable<ReclamationResponseDTO[]> {
    return this.http.get<ReclamationResponseDTO[]>(
      `${this.baseUrl}/archived`, 
      { headers: this.getHeaders() }
    );
  }

  // User methods
  createReclamation(reclamationData: ReclamationRequest): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/save`, 
      reclamationData, 
      { headers: this.getHeaders() }
    );
  }

  getUserReclamations(): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(
      `${this.baseUrl}/mes-reclamations`,
      { headers: this.getHeaders() }
    );
  }
}