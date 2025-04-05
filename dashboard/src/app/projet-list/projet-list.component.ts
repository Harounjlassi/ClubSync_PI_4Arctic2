import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Projet } from "app/common/projet";
import { ProjetService } from "app/services/projet.service";

@Component({
  selector: "app-projet-list",
  templateUrl: "./projet-list.component.html",
  styleUrls: ["./projet-list.component.scss"],
})
export class ProjetListComponent implements OnInit {
  projectsWithColors: any[] = [];

  projets: Projet[] = [];
  color: string = "";

  constructor(private sanitizer: DomSanitizer,
    private projetService: ProjetService,

    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.listProjets();

    
  }
  listProjets() {
    this.projetService.getProjets().subscribe(
      (data) => {
        console.log("Received projects:", data);
        this.projets = data || [];
        
        // Assign colors AFTER data is loaded
        this.projectsWithColors = this.projets.map(project => ({
          ...project,
          cardColor: this.getRandomColor(),
          progressColor: this.generateProgressColor(project) // Modified to be deterministic
        }));
        console.log("Projects with colors:", this.projectsWithColors);
      },
      (error) => {
        console.error("Error fetching projects:", error);
      }
    );
  }

  // In your component.ts file
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
      name: 'Not_Started',
      icon: {
        path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
        animation: `
          <animateTransform 
            attributeName="transform" 
            type="scale" 
            values="1;1.1;1" 
            dur="2s" 
            repeatCount="indefinite"
          />
        `
      },
      color: '#94a3b8' // Cool gray
    },
    {
      name: 'IN_PROGRESS',
      icon: {
        path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z M12 6v6l4 2',
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
        extraAttributes: 'stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="5,3"'
      },
      color: '#60a5fa' // Light blue
    },
    {
      name: 'Stopped',
      icon: {
        path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z M9 9h6v6H9z',
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
        color: '#ef4444' // Red
      }
    },
    {
      name: 'Finished',
      icon: {
        path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
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
        color: '#10b981' // Green
      }
    }
  ];
  
  getStatusIcon(status: string) {
    return this.projectStatuses.find(s => s.name === status)?.icon || this.projectStatuses[0].icon;
  }
  
  getStatusColor(status: string) {
    return this.projectStatuses.find(s => s.name === status)?.color || '#6b7280';
  }
  
  getSanitizedSvg(status: string) {
    const icon = this.getStatusIcon(status);
    const svg = `
      <svg viewBox="0 0 24 24" fill="${icon.color || this.getStatusColor(status)}" 
           ${icon.extraAttributes || ''}>
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
    if (!project.cardColor) return '';
    return project.cardColor.replace("135deg", "90deg");
  }

  showProjectReports(project: any) {
    // Your report display logic here
    console.log('Showing reports for:', project.nom);
   
  }








  projetRports(){
    // Your report display logic here
    console.log('Showing reports for:');
  }




























}