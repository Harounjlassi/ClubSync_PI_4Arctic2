import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Projet } from 'app/models/projet';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';
import { UserService } from './user.service';
import { switchMap } from 'rxjs';
import { User } from "app/models/user.model";

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  
    private users: User[];
  
  constructor(private httpClient:HttpClient,private userService: UserService ) { }
  //private baseUrl = 'http://localhost:8080/api/products?size=100';
  private baseUrl = 'http://localhost:8080/clubsync/projets';
  private faceDetTaskUrl = 'http://localhost:5100/';
  //private faceDetTaskUrl = 'http://localhost:5100/';
  genAiTaskUrl = 'http://localhost:5200/generate-tasks';
  genAiTasks(projet:Projet){
    return this.httpClient.post(this.genAiTaskUrl , {
      assignee_id: projet.createurId,
      description: projet.description,
      projet_id: projet.id,


    });


  }
  startFaceDetTask(){
    return this.httpClient.post(this.faceDetTaskUrl + 'start-detection', {});
  }
  stopFaceDetTask(){
    return this.httpClient.post(this.faceDetTaskUrl + 'stop-detection',{});
  }
  getProjets(): Observable<Projet[]> {
    
    const getUrl = `${this.baseUrl}/all`;
    return this.httpClient.get<Projet[]>(getUrl).pipe(
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
 
  addProjet(newProject: Projet) {
    console.log('Fsssssssssues:', newProject);
    console.log(newProject);
    return this.userService.getUserByUsername(newProject.createur).pipe(
      switchMap(users => {
        if (!users || users.length === 0) {
          alert('No  found User for the given project');
          return throwError(() => new Error('No  found for the given user'));
        }

        const addUrl = `${this.baseUrl}/add`;

        const payload = {
          nom: newProject.nom,
          description: newProject.description,
          imageUrl: newProject.imageUrl,
          dateCreated: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          status: newProject.status,
          progress: newProject.progress || 0,
        
          createurId: users[0].idUser, // Accessing the first task's ID
          // ProjetId: task.ProjetId
        };

        console.log('Submitting report:', payload);
        return this.httpClient.post<Projet>(addUrl, payload);
      }),
      catchError(error => {
        console.error('Failed to create task:', error);
        return throwError(() => new Error('Failed to create task'));
      })
    );  }

    updateProjet(newProject: Projet) {
      console.log('Fsssssssssues:', newProject);
      console.log(newProject);
      return this.userService.getUserByUsername(newProject.createur).pipe(
        switchMap(users => {
          if (!users || users.length === 0) {
            alert('No  found User for the given project');

            return throwError(() => new Error('No  found for the given user'));
          }
  
          const updateUrl = `${this.baseUrl}/update/${newProject.id}`;
  
          const payload = {
            nom: newProject.nom,
            description: newProject.description,
            imageUrl: newProject.imageUrl,
            dateCreated: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            status: newProject.status,
            progress: newProject.progress || 0,
          
            createurId: users[0].idUser, 
          };
  
          console.log('Submitting report:', payload);
          return this.httpClient.put<Projet>(updateUrl, payload);
        }),
        catchError(error => {
          console.error('Failed to create task:', error);
          return throwError(() => new Error('Failed to create task'));
        })
      );  }

    deletePropjet(projetID: number): Observable<void> {
      return this.httpClient.delete<void>(`${this.baseUrl}/delete/${projetID}`);
    }

   
}