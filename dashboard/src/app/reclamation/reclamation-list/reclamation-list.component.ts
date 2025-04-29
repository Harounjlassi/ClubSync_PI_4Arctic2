import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReclamationService } from '../../services/reclamation.service';
import { ReclamationResponseDTO } from '../../models/reclamation.model';

@Component({
  selector: 'app-reclamation-list',
  templateUrl: './reclamation-list.component.html',
  styleUrls: ['./reclamation-list.component.scss']
})
export class ReclamationListComponent implements OnInit {
  reclamations: ReclamationResponseDTO[] = [];
  loading = false;
  showArchived = false;

  constructor(
    private reclamationService: ReclamationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.loading = true;
    if (this.showArchived) {
      this.reclamationService.getArchivedReclamations().subscribe(
        data => {
          this.reclamations = data;
          this.loading = false;
        },
        error => {
          console.error('Error fetching archived reclamations:', error);
          this.loading = false;
        }
      );
    } else {
      this.reclamationService.getAllReclamations().subscribe(
        data => {
          this.reclamations = data;
          this.loading = false;
        },
        error => {
          console.error('Error fetching reclamations:', error);
          this.loading = false;
        }
      );
    }
  }

  toggleArchived(): void {
    this.showArchived = !this.showArchived;
    this.loadReclamations();
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin/reclamations/edit', id]);
  }

  archiveReclamation(id: number): void {
    if (confirm('Are you sure you want to archive this reclamation?')) {
      this.reclamationService.archiveReclamation(id).subscribe(
        () => {
          this.loadReclamations();
        },
        error => {
          console.error('Error archiving reclamation:', error);
        }
      );
    }
  }

  restoreReclamation(id: number): void {
    this.reclamationService.restoreReclamation(id).subscribe(
      () => {
        this.loadReclamations();
      },
      error => {
        console.error('Error restoring reclamation:', error);
      }
    );
  }

  deleteReclamation(id: number): void {
    if (confirm('Are you sure you want to permanently delete this reclamation? This action cannot be undone.')) {
      this.reclamationService.deleteReclamation(id).subscribe(
        () => {
          this.loadReclamations();
        },
        error => {
          console.error('Error deleting reclamation:', error);
        }
      );
    }
  }

  trackById(index: number, item: ReclamationResponseDTO): number {
    return item.idReclamation;
  }
}