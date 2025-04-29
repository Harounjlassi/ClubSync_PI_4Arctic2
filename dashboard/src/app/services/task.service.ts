// task.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProjetTask } from 'app/models/projet-task';
import { User } from "app/models/user.model";
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = "http://localhost:8080/clubsync/taches";
  private users: User[];

  constructor(private http: HttpClient,  private httpClient: HttpClient,   private userService: UserService,
  ) {}

  getTasksByIdProjet(projectId: number): Observable<ProjetTask[]> {
    return this.http.get<ProjetTask[]>(`${this.baseUrl}/findByTacheByIdProjet/${projectId}`);
  }

  getTaskById(taskId: string): Observable<ProjetTask> {
    return this.http.get<ProjetTask>(`${this.baseUrl}/${taskId}`);
  }

  createTask(task: ProjetTask): Observable<ProjetTask> {
    console.log('Fsssssssssues:', task);
    console.log(task);
    return this.userService.getUserByUsername(task.assignee).pipe(
      switchMap(users => {
        if (!users || users.length === 0) {
          return throwError(() => new Error('No tasks found for the given user'));
        }

        const addUrl = `${this.baseUrl}/add`;

        const payload = {
          titre: task.titre,
          description: task.description,
          status: task.status || 'todo',
          priorite: task.priorite || 'medium',
          dueDate: task.dueDate,
          progress: task.progress || 50,
          label: task.label,
          dateCreated: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          ReporterId: 1,
          AssigneeId: users[0].idUser, // Accessing the first task's ID
          ProjetId: task.ProjetId
        };

        console.log('Submitting report:', payload);
        return this.httpClient.post<ProjetTask>(addUrl, payload);
      }),
      catchError(error => {
        console.error('Failed to create task:', error);
        return throwError(() => new Error('Failed to create task'));
      })
    );
  }

  updateTask(task: ProjetTask): Observable<ProjetTask> {
    return this.http.put<ProjetTask>(`${this.baseUrl}/update/${task.id}`, task);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${taskId}`);
  }

  getTasksByStatus(projectId: number, status: string): Observable<ProjetTask[]> {
    return this.http.get<ProjetTask[]>(`${this.baseUrl}/${projectId}/status/${status}`);
  }
  getTasksByTitre(theTasktitre: string): Observable<ProjetTask[]> {
    // return this.httpClient.get<ProjetTask[]>(`${this.baseUrl}/findByTacheByTitre/${theTasktitre}`).pipe(
    //   map(response => response),
    //   catchError(error => throwError(() => new Error(error.message || "API Error")))
    // );
    return this.http.get<ProjetTask[]>(`${this.baseUrl}/findByTacheByTitre/${theTasktitre}`);
  }
}