import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, forkJoin, switchMap, tap, throwError } from "rxjs";
import { Report } from "app/models/report";
import { TaskService } from "./task.service";
import { ProjetTask } from "app/models/projet-task";
import { UserService } from "./user.service";
import { User } from "app/models/user.model";
import { NotificationService } from './notification.service'; // Use NotificationService without importing a component


@Injectable({
  providedIn: "root",
})
export class ReportService {
  private baseUrl = "http://localhost:8080/clubsync/reports";
  private tasks: ProjetTask []; 
  private users: User[];

  constructor(private httpClient: HttpClient, private taskService: TaskService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  getReportsByProjectId(projectId: number): Observable<Report[]> {
    return this.httpClient.get<Report[]>(
      `${this.baseUrl}/findByProjetId/${projectId}`
    ).pipe(
      catchError(error => {
        console.error("Error fetching reports:", error);
        throw error;
      })
    );
  }

  
  
  createReport(report:Report): Observable<Report> {
    console.log(report);
    return forkJoin({
      tasks: this.taskService.getTasksByTitre(report.TacheTitre),
      users: this.userService.getUserByUsername(report.ReporterFirstName) // Assuming report.username exists
    }).pipe(
      switchMap(({ tasks, users })  => {
        if (!tasks || tasks.length === 0) {
          console.log('No tasks found');
          this.notificationService.showError('No tasks found for the given title');

          return throwError(() => new Error('No tasks found for the given title'));
        }
        if (!users || users.length === 0) {
          console.log('User not found');
          this.notificationService.showError('User not found');

          return throwError(() => new Error('User not found'));
        }

        const addUrl = `${this.baseUrl}/add`;

        const payload = {
          title: report.title,
          description: report.description,
          status: report.status || 'Pending',
          dateCreated: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          ReporterId: users[0].idUser, // Accessing the first user's ID
          TacheId: tasks[0].id, // Accessing the first task's ID
          ProjetId: report.ProjetId
        };

        console.log('Submitting report:', payload);
        return this.httpClient.post<Report>(addUrl, payload);
      }),
      catchError(error => {
        console.error('Failed to create report:', error);
        return throwError(() => new Error('Failed to create report'));
      })
    );
}

  
  deleteMultipleReports(ids: number[]): Observable<void> {
    // Implement either:
    // Option 1: If your API supports bulk deletion
    return this.httpClient.delete<void>(`${this.baseUrl}/bulk`, { body: { ids } });
    
    // Option 2: If you need to delete one by one
    // return forkJoin(ids.map(id => this.deleteReport(id)));
  }

  updateReport(report: Report): Observable<Report> {





    console.log(report);
    return forkJoin({
      tasks: this.taskService.getTasksByTitre(report.TacheTitre),
      users: this.userService.getUserByUsername(report.ReporterFirstName) // Assuming report.username exists
    }).pipe(
      switchMap(({ tasks, users })  => {
        if (!tasks || tasks.length === 0) {
          console.log('No tasks found');
          this.notificationService.showError('No tasks found for the given title');

          return throwError(() => new Error('No tasks found for the given title'));
        }
        if (!users || users.length === 0) {
          console.log('User not found');
          this.notificationService.showError('User not found');

          return throwError(() => new Error('User not found'));
        }

        const putUrl = `${this.baseUrl}/update/${report.id}`;

        const payload = {
          title: report.title,
          description: report.description,
          status: report.status || 'Pending',
          dateCreated: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          ReporterId: users[0].idUser, // Accessing the first user's ID
          TacheId: tasks[0].id, // Accessing the first task's ID
          ProjetId: report.ProjetId
        };

        console.log('Submitting report:', payload);
        return this.httpClient.put<Report>(putUrl, payload);
      }),
      catchError(error => {
        console.error('Failed to create report:', error);
        return throwError(() => new Error('Failed to create report'));
      })
    );
  
  }

  deleteReport(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}