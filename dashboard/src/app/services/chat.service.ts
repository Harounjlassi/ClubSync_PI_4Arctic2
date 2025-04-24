import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = 'http://localhost:8080/clubsync/chat';

  constructor(private http: HttpClient) { }

  sendPrompt(prompt: string): Observable<string> {
    return this.http.get(this.API_URL, {
      params: { prompt },
      responseType: 'text'  // Important: Expect text response, not JSON
    }).pipe(
      catchError((error) => {
        console.error('Erreur API chatbot:', error);
        return this.handleError(error);
      })
    );
  }

  private handleError(error: any): Observable<string> {
    // Personnalisez les messages d'erreur selon le code HTTP
    if (error.status === 0) {
      return of('Erreur de connexion au serveur');
    }
    if (error.status === 500) {
      return of('Erreur interne du serveur');
    }
    return of('Erreur lors de la communication avec le chatbot');
  }
// Modifiez la méthode uploadFile dans chat.service.ts
uploadFile(file: File): Observable<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  return this.http.post(`${this.API_URL}/upload`, formData, {
    responseType: 'text'  // Ajouter cette ligne pour forcer une réponse texte
  }).pipe(
    catchError((error) => {
      console.error('Erreur lors du téléchargement du fichier:', error);
      return this.handleError(error);
    })
  );
}
}