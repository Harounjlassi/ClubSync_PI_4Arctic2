import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReclamationService } from '../../services/reclamation.service';
import { ReclamationResponse, ReclamationStatus } from '../../models/reclamation.model';

@Component({
  selector: 'app-reclamation-detail',
  templateUrl: './reclamation-detail.component.html',
  styleUrls: ['./reclamation-detail.component.scss']
})
export class ReclamationDetailComponent implements OnInit {
  reclamation: ReclamationResponse | null = null;
  loading = true;
  error = false;
  reclamationId!: number;

  // For easy access in template
  ReclamationStatus = ReclamationStatus;

  constructor(
    private reclamationService: ReclamationService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.reclamationId = +this.route.snapshot.paramMap.get('id')!;
    this.loadReclamation();
  }

  loadReclamation(): void {
    this.loading = true;
    this.reclamationService.getReclamationById(this.reclamationId).subscribe(
      data => {
        this.reclamation = data;
        this.loading = false;
      },
      error => {
        console.error('Error fetching reclamation details:', error);
        this.loading = false;
        this.error = true;
      }
    );
  }

  archiveReclamation(): void {
    if (confirm('Are you sure you want to archive this reclamation?')) {
      this.reclamationService.archiveReclamation(this.reclamationId).subscribe(
        () => {
          this.router.navigate(['/admin/reclamations']);
        },
        error => {
          console.error('Error archiving reclamation:', error);
        }
      );
    }
  }

  restoreReclamation(): void {
    this.reclamationService.restoreReclamation(this.reclamationId).subscribe(
      () => {
        this.loadReclamation();
      },
      error => {
        console.error('Error restoring reclamation:', error);
      }
    );
  }

  deleteReclamation(): void {
    if (confirm('Are you sure you want to permanently delete this reclamation? This action cannot be undone.')) {
      this.reclamationService.deleteReclamation(this.reclamationId).subscribe(
        () => {
          this.router.navigate(['/admin/reclamations']);
        },
        error => {
          console.error('Error deleting reclamation:', error);
        }
      );
    }
  }

  editReclamation(): void {
    this.router.navigate(['/admin/reclamations/edit', this.reclamationId]);
  }

  goBack(): void {
    this.router.navigate(['/admin/reclamations']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case ReclamationStatus.IN_PROGRESS:
        return 'status-in-progress';
      case ReclamationStatus.RESOLVED:
        return 'status-resolved';
      case ReclamationStatus.REJECTED:
        return 'status-rejected';
      default:
        return '';
    }
  }
}