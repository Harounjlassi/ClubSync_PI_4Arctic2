import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Message } from "app/common/message";
import { Projet } from "app/common/projet";
import { User } from "app/common/user";
import { MessageService } from "app/services/message.service";
import { ProjetService } from "app/services/projet.service";
import { UserService } from "app/services/user.service";

@Component({
  selector: "app-projet-list",
  templateUrl: "./projet-list.component.html",
  styleUrls: ["./projet-list.component.scss"],
})
export class ProjetListComponent implements OnInit {
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

  constructor(
    private sanitizer: DomSanitizer,
    private projetService: ProjetService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,

    private router: Router
  ) {
    this.createAddProjectForm();
    this.createEditProjectForm();
  }

  ngOnInit() {
    this.listProjets();
    this.listMessages();
  }
  listMessages() {
    this.messageService.getMessages().subscribe(
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
    this.projetService.getProjets().subscribe(
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

deleteMessage(messageId: number) {
  if (confirm('Are you sure you want to delete this message?')) {
    this.projectMessages = this.projectMessages.filter(m => m.id !== messageId);
    
    // In a real app, call your API:
    // this.projetService.deleteMessage(messageId).subscribe(...);
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
    message.lastUpdated = new Date(); // Update timestamp
    message.isEditing = false;
    
    // In a real app, call your API:
    // this.projetService.updateMessage(message).subscribe(...);
  }
}

// Update your existing addMessage method to include ID
addMessage() {
  // if (this.newMessage.trim()) {
  //   const newMsg: Message = {
  //     id: this.newMessage
  //     contenu: this.newMessage,
  //     dateCreated: new Date()
  //   };
  //   this.projectMessages.push(newMsg);
  //   this.newMessage = '';
    
    // In a real app:
    // this.projetService.addMessage(this.selectedProjectForMessages.id, newMsg).subscribe(...);
  //}
}
  openMessagesModal(project: Projet) {
    this.selectedProjectForMessages = project;
    // Load existing messages (in a real app, you'd fetch from API)
    // this.projectMessages = [
    //   { content: "Project initialized", date: new Date(project.dateCreated) },
    //   { content: `Progress reached ${project.progress}%`, date: new Date() },
    // ];
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
    this.projetService.deletePropjet(project.id).subscribe((response) => {
      this.listProjets(); // Refresh the list
    });
  }

  createAddProjectForm() {
    this.addProjectForm = this.fb.group({
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
    this.imagePreview = reader.result as string;
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

    this.userService.getUserById(project.createurId).subscribe(
      (data) => {
        console.log("Received user:", data);
        this.user = data;
        console.log("Received user:", this.user[0].username);

        this.editProjectForm.patchValue({
          id: project.id || null,
          nom: project.nom || "",
          description: project.description || "",
          imageUrl: project.imageUrl || "",
          status: project.status || "Not_Started",
          progress: project.progress || 0,
          createur: this.user[0].username || "",
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

    if (this.addProjectForm.valid) {
      const newProject: Projet = {
        ...this.addProjectForm.value,
        id: null,
        imageUrl: this.imagePreview, // Or null if no image
        dateCreated: new Date().toISOString(), // Will be assigned by the backend
      };
      console.log("imma");
      console.log(newProject);
      this.projetService.addProjet(newProject).subscribe(
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
      this.projetService.updateProjet(newProject).subscribe(
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
}
