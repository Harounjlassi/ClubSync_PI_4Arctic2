import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReclamationService } from '../services/reclamation.service';
import { 
  ReclamationResponse, 
  ReclamationRequest, 
  ReclamationType,
  ReclamationStatus
} from '../models/reclamation.model';

@Component({
  selector: 'app-reclamation-edit-dialog',
  templateUrl: './reclamation-edit-dialog.component.html',
  styleUrls: ['./reclamation-edit-dialog.component.scss']
})
export class ReclamationEditDialogComponent implements OnInit {
  reclamationForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // Make enums available to the template
  reclamationTypes = Object.values(ReclamationType);
  reclamationStatuses = Object.values(ReclamationStatus);
  
  // Store original data for comparison
  originalReclamation: ReclamationResponse | null = null;
  isAdmin = false; // Set based on user role - implement with your auth service

  constructor(
    private fb: FormBuilder,
    private reclamationService: ReclamationService,
    public dialogRef: MatDialogRef<ReclamationEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reclamationId: number, isAdmin?: boolean }
  ) {
    this.isAdmin = data.isAdmin || false;
    
    // Create form with all fields disabled except status for admin
    this.reclamationForm = this.fb.group({
      typeReclamation: [{value: '', disabled: true}],
      description: [{value: '', disabled: true}],
      statut: [{value: '', disabled: !this.isAdmin}]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.reclamationId) {
      this.loadReclamationData();
    } else {
      this.errorMessage = 'Invalid reclamation ID provided.';
    }
  }

  loadReclamationData(): void {
    this.loading = true;
    this.reclamationService.getReclamationById(this.data.reclamationId).subscribe({
      next: (reclamation) => {
        this.originalReclamation = reclamation;
        
        this.reclamationForm.patchValue({
          typeReclamation: reclamation.typeReclamation,
          description: reclamation.description,
          statut: reclamation.statut
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reclamation:', error);
        this.errorMessage = `Failed to load reclamation details. ID: ${this.data.reclamationId}`;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.reclamationForm.invalid || !this.isAdmin) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    
    const reclamationRequest: ReclamationRequest = {
      // Preserve the original values for these fields
      typeReclamation: this.originalReclamation?.typeReclamation as ReclamationType,
      description: this.originalReclamation?.description || '',
      // Only update the status field
      statut: this.reclamationForm.getRawValue().statut as ReclamationStatus
    };

    this.reclamationService.updateReclamation(this.data.reclamationId, reclamationRequest).subscribe({
      next: () => {
        this.successMessage = 'Reclamation status updated successfully!';
        this.loading = false;
        // Close dialog after a short delay to show success message
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 1500);
      },
      error: (error) => {
        console.error('Error updating reclamation:', error);
        this.errorMessage = 'Failed to update reclamation status. Please try again.';
        this.loading = false;
      }
    });
  }

  // Helper methods to safely handle possible ReclamationResponseDTO properties
  hasUserInfo(): boolean {
    return this.originalReclamation !== null && 
           'userName' in this.originalReclamation && 
           'userEmail' in this.originalReclamation;
  }
  
  getUserName(): string {
    if (this.hasUserInfo()) {
      return (this.originalReclamation as any).userName || 'Unknown';
    }
    return 'Unknown';
  }
  
  getUserEmail(): string {
    if (this.hasUserInfo()) {
      return (this.originalReclamation as any).userEmail || 'No email provided';
    }
    return 'No email provided';
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}