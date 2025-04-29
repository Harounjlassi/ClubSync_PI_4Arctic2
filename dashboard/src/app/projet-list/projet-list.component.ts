import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Message } from "app/models/message";
import { Projet } from "app/models/projet";	
import { User } from "app/models/user.model";
import { CalenderApiService } from "app/services/calender-api.service";
import { FaceRecognitionService } from "app/services/face-recognition.service";
import { MessageService } from "app/services/message.service";
import { ProjetService } from "app/services/projet.service";
import { UserService } from "app/services/user.service";
import { Subject, takeUntil } from "rxjs";
// import { AppProjetMessageComponent } from '../projet-message/projet-message.component'; // Import the component


@Component({
  selector: "app-projet-list",
  templateUrl: "./projet-list.component.html",
  styleUrls: ["./projet-list.component.scss"],
})
export class ProjetListComponent implements OnInit, OnDestroy {
  projectsWithColors: any[] = [];
  projets: Projet[] = [];
  color: string = "";
  showAddProjectModal: boolean = false;
  showEditProjectModal: boolean = false;
  addProjectForm: FormGroup;
  editProjectForm: FormGroup;
  selectedProject: Projet;
  user: User;
  imagePreview: string;
  detectedFaces: any[] = [];
  cameraStatus = 'stopped';
  selectedFile: File = null;
  showMessagesModal = false;
  newMessage = "";
  selectedProjectForMessages: Projet;
  // projectMessages: {text: string, date: Date}[] = [
  //   {text: 'Message 1', date: new Date()},
  //   {text: 'Message 2', date: new Date()},
  //   {text: 'Message 3', date: new Date()}
  // ];
  projectMessages: Message[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private sanitizer: DomSanitizer,
    private projetService: ProjetService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private faceService: FaceRecognitionService,
    private router: Router,
    private calendarService: CalenderApiService,
  ) {
    this.createAddProjectForm();
    this.createEditProjectForm();
  }

  ngOnInit() {
    this.listProjets();
  }

  ngOnDestroy(): void {
    // Properly cancel all subscriptions when component is destroyed
    this.destroy$.next();
    this.destroy$.complete();
    
    // Stop camera if it's still running when component is destroyed
    if (this.cameraStatus === 'running') {
      this.stopCamera();
    }
  }

  listMessages(id: number) {
    this.messageService.getMessageByIdProjet(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          console.log("Received projects:", data);
          this.projectMessages = data || [];
          console.log(" projectMessages:", this.projectMessages);
        },
        (error) => {
          console.error("Error fetching projects:", error);
        }
      );
  }

  listProjets() {
    this.projetService.getProjets()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          console.log("Received projects:", data);
          this.projets = data || [];

          // Assign colors AFTER data is loaded
          this.projectsWithColors = this.projets.map((project) => ({
            ...project,
            cardColor: this.getRandomColor(),
            progressColor: this.generateProgressColor(project), // Modified to be deterministic
          }));
          console.log("Projects with colors:", this.projectsWithColors);
        },
        (error) => {
          console.error("Error fetching projects:", error);
        }
      );
  }

  // Generate unique IDs (simple implementation)
  private generateMessageId(): number {
    return this.projectMessages.length > 0 
      ? Math.max(...this.projectMessages.map(m => m.id)) + 1 
      : 1;
  }

  navigateToMessages(projectId: number) {
    // Navigate to the route
    this.router.navigate(['/message', projectId]);
    
    // Also open the modal if you want both
    //this.openMessagesModal(this.tempProjet);
  }

  deleteMessage(messageId: number) {
    if (confirm('Are you sure you want to delete this message?')) {
      this.projectMessages = this.projectMessages.filter(m => m.id !== messageId);
      
      this.messageService.deleteMessage(messageId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            console.log("Deleted message:", data);
          },
          (error) => {
            console.error("Error deleting message:", error);
          }
        );
    }
  }

  startEditingMessage(message: Message) {
    message.isEditing = true;
    message.editedText = message.contenu;
  }

  cancelEditing(message: Message) {
    message.isEditing = false;
    message.editedText = '';
  }

  saveEditedMessage(message: Message) {
    if (message.editedText?.trim()) {
      message.contenu = message.editedText;
      message.lastUpdated = new Date(); 
      message.isEditing = false;
      
      this.messageService.updateMessage(message)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            console.log("Updated message:", data);
          },
          (error) => {
            console.error("Error updating message:", error);
          }
        );
    }
  }

  addMessage() {
    if (this.newMessage.trim()) {
      const newMsg = {
        contenu: this.newMessage,
        dateCreated: new Date(),
        lastUpdated: new Date(),
        ProjetId: this.selectedProjectForMessages.id,
        isEditing: false,
        editedText: '' // Reset editedText for new message
      };

      // In a real app:
      this.messageService.createMessage(newMsg)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (message) => {
            console.log("Message created:", message);
            this.projectMessages.push(message);
            this.newMessage = ""; // Clear the input field after success
          },
          (error) => {
            console.error("Error creating message:", error);
          }
        );
    }
  }

  openMessagesModal(project: Projet) {
    this.selectedProjectForMessages = project;
    // Load existing messages (in a real app, you'd fetch from API)
    // this.projectMessages = [
    //   { content: "Project initialized", date: new Date(project.dateCreated) },
    //   { content: `Progress reached ${project.progress}%`, date: new Date() },
    // ];
    this.listMessages(project.id);

    this.showMessagesModal = true;
  }

  closeMessagesModal() {
    this.showMessagesModal = false;
    this.newMessage = "";
  }

  projectColors = [
    {
      name: "Emerald",
      gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    },
    {
      name: "Coral",
      gradient: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
    },
    {
      name: "Royal",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    },
    {
      name: "Sunset",
      gradient: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
    },
    {
      name: "Ocean",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
    },
    {
      name: "Ruby",
      gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    },
  ];

  projectStatuses = [
    {
      name: "Not_Started",
      icon: {
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
        animation: `
          <animateTransform 
            attributeName="transform" 
            type="scale" 
            values="1;1.1;1" 
            dur="2s" 
            repeatCount="indefinite"
          />
        `,
      },
      color: "#94a3b8", // Cool gray
    },
    {
      name: "IN_PROGRESS",
      icon: {
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z M12 6v6l4 2",
        animation: `
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1.8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dashoffset"
            values="0;20;0"
            dur="2s"
            repeatCount="indefinite"
          />
        `,
        extraAttributes:
          'stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="5,3"',
      },
      color: "#60a5fa", // Light blue
    },
    {
      name: "Stopped",
      icon: {
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z M9 9h6v6H9z",
        animation: `
          <animate
            attributeName="opacity"
            values="1;0.6;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill"
            values="#ef4444;#fca5a5;#ef4444"
            dur="2s"
            repeatCount="indefinite"
          />
        `,
        color: "#ef4444", // Red
      },
    },
    {
      name: "Finished",
      icon: {
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
        animation: `
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -2; 0 0"
            dur="1.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill"
            values="#10b981;#86efac;#10b981"
            dur="1.5s"
            repeatCount="indefinite"
          />
        `,
        color: "#10b981", // Green
      },
    },
  ];

  getStatusIcon(status: string) {
    return (
      this.projectStatuses.find((s) => s.name === status)?.icon ||
      this.projectStatuses[0].icon
    );
  }

  getStatusColor(status: string) {
    return (
      this.projectStatuses.find((s) => s.name === status)?.color || "#6b7280"
    );
  }

  getSanitizedSvg(status: string) {
    const icon = this.getStatusIcon(status);
    const svg = `
      <svg viewBox="0 0 24 24" fill="${
        icon.color || this.getStatusColor(status)
      }" 
           ${icon.extraAttributes || ""}>
        <path d="${icon.path}"/>
        ${icon.animation}
      </svg>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  getRandomColor() {
    return this.projectColors[
      Math.floor(Math.random() * this.projectColors.length)
    ].gradient;
  }

  generateProgressColor(project: any) {
    if (!project.cardColor) return "";
    return project.cardColor.replace("135deg", "90deg");
  }

  showProjectReports(project: any) {
    // Your report display logic here
    console.log("Showing reports for:", project.nom);
  }

  openDeleteProjectModal(project: Projet) {
    this.projetService.deletePropjet(project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.listProjets(); // Refresh the list
      });
  }

  // In your component
  get nom() {
    return this.addProjectForm.get('nom');
  }

  createAddProjectForm() {
    this.addProjectForm = this.fb.group({
      id: [null],
      //nom: ["", Validators.required],
      // nom: ['', [
      //   Validators.required,
      //   Validators.minLength(3),
      //   Validators.maxLength(50),
      //   Validators.pattern(/^[a-zA-Z0-9\s\-_]*$/) // Alphanumeric with spaces, hyphens, underscores
      // ]],
      nom: ['', [
        Validators.required,
        Validators.minLength(3),
      ]],
      description: ["", [
        Validators.required,
      ]],
      imageUrl: ["", [
        Validators.required,
      ]],
      status: ["Not_Started", [
        Validators.required,
      ]],
      progress: [0, [
        Validators.required,
      ]],
      createur: ["", [
        Validators.required,
      ]],
      dateCreated: [new Date()],
      lastUpdated: [new Date()],
    });
  }

  createEditProjectForm() {
    this.editProjectForm = this.fb.group({
      id: [null],
      nom: ["", Validators.required],
      description: [""],
      imageUrl: [""],
      status: ["Not_Started"],
      progress: [0],
      createur: [""],
      dateCreated: [new Date()],
      lastUpdated: [new Date()],
      image: [null],
    });
  }

  onImagePicked(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedFile = file;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPEG, PNG, and GIF images are allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      alert("Image size should be less than 2MB");
      return;
    }

    // Convert to Base64 string
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      // Store the Base64 string in the form
      this.addProjectForm.patchValue({
        imageUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imagePreview = null;
    this.selectedFile = null;
    this.addProjectForm.patchValue({ imageUrl: "" });
  }

  openAddProjectModal() {
    this.showAddProjectModal = true;
  }

  startCamera(): void {
    this.faceService.startCamera()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cameraStatus = 'running';
          console.log('Camera started', response);
          // this.addProjectForm.patchValue({
          //   createur: response.faces[0].name
          // });
          //this.detectFaces();
        },
        error: (err) => console.error('Error starting camera', err)
      });
  }

  detectFaces(): void {
    if (this.cameraStatus !== 'running') {
      return; // Don't detect if camera isn't running
    }
  
    this.faceService.detectFaces()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.faces?.length > 0) {
            this.detectedFaces = response.faces;
            console.log('Detected faces:', response);
            
            // Update creator field with first detected face
            this.addProjectForm.patchValue({
              createur: response.faces[0].name
            });
    
            // Auto-refresh every 2 seconds if camera is still running
            if (this.cameraStatus === 'running') {
              setTimeout(() => this.detectFaces(), 2000);
            }
          } else {
            console.log('No faces detected');
            // Still refresh if camera is running but no faces detected
            if (this.cameraStatus === 'running') {
              setTimeout(() => this.detectFaces(), 2000);
            }
          }
        },
        error: (err) => {
          console.error('Face detection error:', err);
          // Retry after 2 seconds even if error occurs
          if (this.cameraStatus === 'running') {
            setTimeout(() => this.detectFaces(), 2000);
          }
        }
      });
  }

  stopCamera(): void {
    this.faceService.stopCamera()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cameraStatus = 'stopped';
          console.log('Camera stopped', response);
        },
        error: (err) => console.error('Error stopping camera', err)
      });
  }

  closeAddProjectModal() {
    this.showAddProjectModal = false;
    this.addProjectForm.reset();
  }

  onEditImagePicked(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPEG, PNG, and GIF images are allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      alert("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.editProjectForm.patchValue({
        imageUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  openEditProjectModal(project: Projet) {
    this.selectedProject = project;

    this.userService.findUserId(project.createurId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          console.log("Received user:", data);
          this.user = data;
          console.log("Received user:", this.user.lastname);

          this.editProjectForm.patchValue({
            id: project.id || null,
            nom: project.nom || "",
            description: project.description || "",
            imageUrl: project.imageUrl || "",
            status: project.status || "Not_Started",
            progress: project.progress || 0,
            createur: this.user.lastname || "",
            dateCreated: project.dateCreated || new Date(),
            lastUpdated: new Date(),
          });
        },
        (error) => {
          console.error("Error getting user:", error);
        }
      );
    console.log(project);

    this.showEditProjectModal = true;
  }

  closeEditProjectModal() {
    this.showEditProjectModal = false;
    this.editProjectForm.reset();
  }

  onAddProjectSubmit() {
    console.log(this.addProjectForm.value);
    if (this.addProjectForm.invalid) {
      alert('Please fix form errors before submitting');
      return;
    }

    if (this.addProjectForm.valid) {
      const newProject: Projet = {
        ...this.addProjectForm.value,
        id: null,
        imageUrl: this.imagePreview, // Or null if no image
        dateCreated: new Date().toISOString(), // Will be assigned by the backend
      };
      console.log("imma");
      console.log(newProject);
      this.projetService.addProjet(newProject)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response) => {
            this.listProjets(); // Refresh the list
            this.closeAddProjectModal();
          },
          (error) => {
            console.error("Error adding project:", error);
          }
        );
    }
  }

  onEditProjectSubmit() {
    console.log(this.editProjectForm.value);

    if (this.editProjectForm.valid) {
      const newProject: Projet = {
        ...this.editProjectForm.value,
        imageUrl: this.imagePreview, // Or null if no image
        lastUpdated: new Date().toISOString(), // Will be assigned by the backend
      };
      console.log("imma");
      console.log(newProject);
      this.projetService.updateProjet(newProject)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response) => {
            this.listProjets(); // Refresh the list
            this.closeAddProjectModal();
          },
          (error) => {
            console.error("Error update project:", error);
          }
        );
    }
  }

  /* Component Logic */
  currentPriority = 1; // 1-4 scale (low-critical)

  getPriorityText(level) {
    const priorities = {
      1: 'Low Priority',
      2: 'Medium Priority',
      3: 'High Priority',
      4: 'Critical!'
    };
    return priorities[level] || 'Analyzing...';
  }

  testcam: number = 1;
  detectFaceAndGenerateTasks() {
    if (this.testcam == 1) {
      this.projetService.startFaceDetTask()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response) => {
            console.log('Face detection task started:', response);
            this.testcam = 2; 
          }
        );
    } else {
      this.projetService.stopFaceDetTask()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response) => {
            console.log('Face detection task stopped:', response);
            this.testcam = 1; 
          }
        );
    }
    
    this.currentPriority = Math.min(4, this.currentPriority + 1); // Demo cycling
  }

  generateAITasks(projet: Projet): void {
    this.projetService.genAiTasks(projet)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          console.log('AI tasks gen:', response);
        }
      );
  }

  addToGoogleCalendar(project: any): void {
    console.log(project);
    const originalDate = project.lastUpdated + "T00:00:00";
    const dateObj = new Date(originalDate);

    // Add 3 days
    dateObj.setDate(dateObj.getDate() + 3);

    // Format back to ISO string and split to get date part
    const newDate = dateObj.toISOString().split('T')[0];
    const dateTimeWithDays = newDate + "T00:00:00";
    
    const eventData = {
      summary: project.nom,
      description: project.description + " is " + project.progress + "% complete ," +
        " and currently in  " + project.status + " Status",
      start: {
        dateTime: project.dateCreated + "T00:00:00",
        //dateTime: "2025-04-21T12:00:00",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        //dateTime:  "2025-04-21T13:00:00",
        dateTime: dateTimeWithDays,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
    
    this.calendarService.initiateGoogleAuth(eventData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
          console.log('Full response:', response); // This will show the complete response structure
          
          // Access the authorization_url from response.body
          if (response.body && response.body.authorization_url) {
            console.log('Authorization URL:', response.body.authorization_url);
            
            // Open the authorization URL in a new browser tab
            this.calendarService.openAuthUrlInBrowser(response.body.authorization_url);
          } else {
            console.error('No authorization URL received in response body');
          }
        },
        (error) => {
          console.error('Error initiating auth:', error);
        }
      );
  }
}