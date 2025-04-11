import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from 'app/common/message';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {


  constructor(private httpClient:HttpClient ) { }
  private baseUrl = 'http://localhost:8080/api/messages';
  getMessages(): Observable<Message[]> {
    
    const getUrl = `${this.baseUrl}/all`;
    return this.httpClient.get<Message[]>(getUrl).pipe(
      map(response => {
        console.log("API Response:", response);
        return response || []; 
      }),
      catchError(error => {
        console.error("API Error:", error);
        return throwError(() => new Error(error.message || "API Error"));
      })
    );
  }
    getTasksByIdProjet(projectId: number): Observable<Message[]> {
      return this.httpClient.get<Message[]>(`${this.baseUrl}/findByTacheByIdProjet/${projectId}`);
    }
  
    getTaskById(taskId: string): Observable<Message> {
      return this.httpClient.get<Message>(`${this.baseUrl}/${taskId}`);
    }
  
    createTask(message: Message): Observable<Message> {
      console.log('Fsssssssssues:', task);
    
          const addUrl = `${this.baseUrl}/add`;
  
      
  
          console.log('Submitting report:', message);
          return this.httpClient.post<Message>(addUrl, message);
     
    }
  
    updateTask(task: Message): Observable<Message> {
      return this.httpClient.put<Message>(`${this.baseUrl}/update/${task.id}`, task);
    }
  
    deleteTask(taskId: string): Observable<void> {
      return this.httpClient.delete<void>(`${this.baseUrl}/delete/${taskId}`);
    }
    

 


}
