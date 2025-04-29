import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReclamationService } from '../../services/reclamation.service';
import { ReclamationResponseDTO } from '../../models/reclamation.model';
import { ReclamationEditDialogComponent } from '../../reclamation-edit-dialog/reclamation-edit-dialog.component';

@Component({
  selector: 'app-reclamation-list',
  templateUrl: './reclamation-list.component.html',
  styleUrls: ['./reclamation-list.component.scss']
})
export class ReclamationListComponent implements OnInit {
  reclamations: ReclamationResponseDTO[] = [];
  loading = false;
  showArchived = false;
  errorMessage: string | null = null;

  constructor(
    private reclamationService: ReclamationService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.loading = true;
    this.errorMessage = null;
    
    if (this.showArchived) {
      // Handle archived reclamations - ensure they're properly typed as ReclamationResponseDTO[]
      this.reclamationService.getArchivedReclamations().subscribe({
        next: (data) => {
          // Cast or map the data to ensure it matches ReclamationResponseDTO[]
          this.reclamations = data as unknown as ReclamationResponseDTO[];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching archived reclamations:', error);
          this.errorMessage = 'Failed to load archived reclamations. Please try again.';
          this.loading = false;
        }
      });
    } else {
      // Regular reclamations should already be typed as ReclamationResponseDTO[]
      this.reclamationService.getAllReclamations().subscribe({
        next: (data) => {
          this.reclamations = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching reclamations:', error);
          this.errorMessage = 'Failed to load reclamations. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  toggleArchived(): void {
    this.showArchived = !this.showArchived;
    this.loadReclamations();
  }

  onEdit(reclamationId: number): void {
    if (!reclamationId) {
      console.error('Invalid reclamation ID:', reclamationId);
      this.showTemporaryMessage('Cannot edit: Invalid reclamation ID');
      return;
    }
    
    const reclamation = this.reclamations.find(r => r.idReclamation === reclamationId);
    
    if (!reclamation) {
      console.error('Reclamation not found for ID:', reclamationId);
      this.showTemporaryMessage('Cannot edit: Reclamation not found');
      return;
    }
    
    const dialogRef = this.dialog.open(ReclamationEditDialogComponent, {
      width: '600px',
      data: { 
        reclamationId: reclamation.idReclamation,  // Using idReclamation
        reclamationData: reclamation,
        isAdmin: true
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadReclamations();
      }
    });
  }

  archiveReclamation(id: number): void {
    if (confirm('Are you sure you want to archive this reclamation?')) {
      this.loading = true;
      this.reclamationService.archiveReclamation(id).subscribe({
        next: () => {
          this.loading = false;
          // Show success message
          this.showTemporaryMessage('Reclamation archived successfully');
          // Reload the list to reflect changes
          this.loadReclamations();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error archiving reclamation:', error);
          // Show error message
          this.errorMessage = 'Failed to archive reclamation. Please try again.';
        }
      });
    }
  }

  restoreReclamation(id: number): void {
    if (confirm('Are you sure you want to restore this reclamation?')) {
      this.loading = true;
      this.reclamationService.restoreReclamation(id).subscribe({
        next: () => {
          this.loading = false;
          // Show success message
          this.showTemporaryMessage('Reclamation restored successfully');
          // Reload the list to reflect changes
          this.loadReclamations();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error restoring reclamation:', error);
          // Show error message
          this.errorMessage = 'Failed to restore reclamation. Please try again.';
        }
      });
    }
  }

  deleteReclamation(id: number): void {
    if (confirm('Are you sure you want to permanently delete this reclamation? This action cannot be undone.')) {
      this.loading = true;
      this.reclamationService.deleteReclamation(id).subscribe({
        next: () => {
          this.loading = false;
          // Show success message
          this.showTemporaryMessage('Reclamation deleted successfully');
          // Reload the list to reflect changes
          this.loadReclamations();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error deleting reclamation:', error);
          // Show error message
          this.errorMessage = 'Failed to delete reclamation. Please try again.';
        }
      });
    }
  }

  showTemporaryMessage(message: string): void {
    // Store the message to display it
    this.errorMessage = message;
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      if (this.errorMessage === message) {
        this.errorMessage = null;
      }
    }, 3000);
  }


  trackById(index: number, item: ReclamationResponseDTO): number {
    return item.idReclamation;  // Using idReclamation
  }
}