import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Message } from 'app/models/message';
import { Projet } from 'app/models/projet';
import { ProjetTask } from 'app/models/projet-task';
import { User } from "app/models/user.model";
import { ProjetService } from 'app/services/projet.service';
import { TaskService } from 'app/services/task.service';
import { UserService } from 'app/services/user.service';
import { finalize } from 'rxjs';
import { Report } from 'app/models/report';
import { ReportService } from 'app/services/report.service';
import { MessageService } from 'app/services/message.service';


@Component({
  selector: 'app-projets',
  templateUrl: './projets.component.html',
  styleUrls: ['./projets.component.scss']
})
export class ProjetsComponent implements OnInit {
  projets: Projet[] = [];


  showModal = false;
  showModalReport = false;
  loading = false;
error: string | null = null;
tasks: {[projectId: number]: ProjetTask[]} = {};
users: {[userId: number]: User} = {};
reports: {[projectId: number]: Report[]} = {};
reportsBy:Report[];
messages:  Message[] ;

notStartedP:number;
plannignP:number;
inProgressP:number;
completedP:number;

 
  constructor(    private projetService: ProjetService,
    private userService: UserService,
    private taskService: TaskService,
    private reportService: ReportService,
    private messageService: MessageService,

    private cdRef: ChangeDetectorRef
  ){

  }

  
  ngOnInit() {

    this.listProjets();
    document.querySelector('.fixed-plugin')?.remove();
    this.completedP=this.projets.filter(p => p.status === 'Finished').length;
    console.log("sssssss"+this.projets);
   setTimeout(() => {
      const preloader = document.getElementById('preloader-active');
      if (preloader) {
        preloader.style.display = 'none';
      }
      
    }, 1000); // Small timeout to ensure content has loaded
  
  }
  


  listProjets() {
    this.projetService.getProjets().subscribe({
      next: (projects) => {
        this.projets = projects || [];
        this.completedP=this.projets.filter(p => p.status === 'Finished').length;
        this.notStartedP=this.projets.filter(p => p.status === 'Not_Started').length;
        this.plannignP=this.projets.filter(p => p.status === 'PLANNING').length;
        this.inProgressP=this.projets.filter(p => p.status === 'IN_PROGRESS').length;
        
        // Load users and tasks
        this.loadAllUsers();
        this.loadAllTasks();
        //this.loadAllReportss();
        
        // Proper logging
        console.log("Projects loaded:", this.projets);
        console.log("Users data:", this.users);
        console.log("Tasks data:", this.tasks);
      },
      error: (err) => {
        console.error('Error loading projects:', err);
      }
    });
  }

  private loadAllUsers(): void {
    const uniqueUserIds = [...new Set(this.projets.map(p => p.createurId))];
    
    uniqueUserIds.forEach(userId => {
      if (!this.users[userId]) {  
        this.userService.findUserId(userId).subscribe({
          next: (user) => {  // Directly get the user object
            if (user && user.idUser) {  // Check for idUser instead of id
              this.users[userId] = user;
              console.log(`Loaded user ${userId}:`, user.lastname);
            } else {
              console.warn(`Invalid user data for ID ${userId}:`, user);
            }
          },
          error: (err) => {
            console.error(`Error loading user ${userId}:`, err);
          }
        });
      }
    });
  }
  
  private loadAllTasks(): void {
    // Get unique project IDs to avoid duplicate requests
    const projectIds = [...new Set(this.projets.map(p => p.id))];
    
    projectIds.forEach(projectId => {
      if (!this.tasks[projectId]) {  // Only load if not already loaded
        this.taskService.getTasksByIdProjet(projectId).subscribe({
          next: (response) => {
            const tasks = Array.isArray(response) ? response : [response];
            
            if (tasks.length > 0 && tasks.every(task => task.id)) {
              this.tasks[projectId] = tasks;
            } else {
              this.tasks[projectId] = [];
            }
          },
          error: (err) => {
            this.tasks[projectId] = [];
          }
        });
      }
    });
  }
  private loadAllReportss(): void {
    // Get unique project IDs to avoid duplicate requests
    const projectIds = [...new Set(this.projets.map(p => p.id))];
    
    projectIds.forEach(projectId => {
      if (!this.tasks[projectId]) {  // Only load if not already loaded
        this.reportService.getReportsByProjectId(projectId).subscribe({
          next: (response) => {
            const reports = Array.isArray(response) ? response : [response];
            
            console.log(`Loaded reports for project ${projectId}:`, reports);
            if (reports.length > 0 && reports.every(report => report.id)) {
              this.reports[projectId] = reports;
            } else {
              this.reports[projectId] = [];
            }
          },
          error: (err) => {
            this.reports[projectId] = [];
          }
        });
      }
    });
  }
  getProjectReports(projectId: number): Report[] {
    // Ensure we have fresh data
    if (!this.reports[projectId]) {
      this.loadAllReportss(); // Trigger load if not already loaded
    }
    this.reportsBy = this.reports[projectId] || [];
    console.log("reports");
        console.log(this.reportsBy);
    return this.reportsBy;
  }
  
  // Modal control
  // In your component class


openModalReports(projectId: number): void {
  this.showModalReport = true;
  document.body.style.overflow = 'hidden';
  
  console.log("Opening modal for project:", projectId);
  console.log("Current reports cache:", this.reports);

  // Check if we already have reports for this project
  if (this.reports[projectId]) {
    this.reportsBy = this.reports[projectId];
    console.log("Using cached reports:", this.reportsBy);
  } else {
    console.log("Fetching reports from API...");
    this.reportService.getReportsByProjectId(projectId).subscribe({
      next: (response) => {
        // Normalize response to always be an array
        this.reportsBy= response ;
        console.log("Fetched reports:", this.reportsBy);
        

      },
      error: (err) => {
        console.error("Error loading reports:", err);
        this.reportsBy = [];
      }
    });
  }
}
trackByReportId(index: number, report: Report): number {
  return report.id; // Or use index if id isn't available
}

  loadUser(userId: number): void {
    this.userService.findUserId(userId).subscribe({
      next: (response) => {
        // Handle case where response is an array
        const user = Array.isArray(response) ? response[0] : response;
        
        // Store the user object directly, not in an array
        this.users[userId] = user;
       // console.log('User loaded:', user.username); // Verify
      },
      error: (err) => {
        console.error('Error loading user:', err);
      }
    });
  }
  
  // Safe accessor methods
 // Add debug logs to your getUserName method
getUserName(id: number): string {
  //console.log('Current users state:', this.users); // Debug 1
  //console.log('Requested user ID:', id); // Debug 2
  
  const user = this.users[id];
  //console.log('Found user:', user); // Debug 3
  
  if (!user) {
    //console.log('User not found, loading...'); // Debug 4
    this.loadUser(id);
    return 'Loading...';
  }
  
  //console.log('Username:', user.username); // Debug 5
  return user.lastname || 'Unknown';
}
  
    // getProjectTasks(projectId: number): ProjetTask[] {
    //   console.log( this.tasks[projectId] );
    //   return this.tasks[projectId] || [];
    // }
  getProjectTasks(projectId: number): any[] {
    // Get tasks for this project
    const tasks = this.tasks[projectId] || [];
    
    // Map to your status system if needed
    return tasks.map(task => {
      return {
        ...task,
        status: this.getTaskStatus(task) // 'COMPLETED', 'IN_PROGRESS', or 'PENDING'
      };
    });
  }
  
  private getTaskStatus(task: any): string {
    // Implement your status logic here
    if (task.status=='done') return 'COMPLETED';
    if (task.status =='inProgress') return 'IN_PROGRESS';
    if (task.status == 'todo')  return 'TO_DO';
    return 'PENDING';
  }
  openModal(projectId:number) {
    this.showModal = true;

    document.body.style.overflow = 'hidden';
  
    console.log("Opening modal for project:", projectId);
    console.log("Current messgeas  cache:", this.messages);
  
    // Check if we already have reports for this project
   
   
      console.log("Fetching messages from API...");
      this.messageService.getMessageByIdProjet(projectId).subscribe({
        next: (response) => {
          // Normalize response to always be an array
          this.messages= response ;
          console.log("Fetched messages:", this.messages);
          
  
        },
        error: (err) => {
          console.error("Error loading messages:", err);
          this.messages = [];
        }
      });
    }
 

  closeModal() {
    this.showModal = false;
    this.showModalReport = false;
    this.messages = [];
    document.body.style.overflow = ''; // Re-enable scrolling
  }

  // Close modal when clicking outside content
  onOverlayClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  // Close modal with Escape key
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.showModal) {
      this.closeModal();
    }
  }
 
  

}