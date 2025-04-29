import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReclamationService } from '../../services/reclamation.service';
import { ReclamationType } from '../../models/reclamation.model';

@Component({
  selector: 'app-reclamation-edit',
  templateUrl: './reclamation-edit.component.html',
  styleUrls: ['./reclamation-edit.component.scss']
})
export class ReclamationEditComponent implements OnInit {
  reclamationForm: FormGroup;
  submitted = false;
  loading = false;
  reclamationId: number;
  reclamationTypes = Object.values(ReclamationType);
  statusOptions = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
  isLoadingData = true;

  constructor(
    private formBuilder: FormBuilder,
    private reclamationService: ReclamationService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Initialize form with validators
    this.reclamationForm = this.formBuilder.group({
      typeReclamation: ['', Validators.required],
      description: ['', [
        Validators.required, 
        Validators.minLength(20), 
        Validators.maxLength(500)
      ]],
      statut: ['', Validators.required],
      dateResolution: [null]
    });

    // Get reclamation ID from route parameters
    this.route.params.subscribe(params => {
      this.reclamationId = +params['id']; // Convert string to number with '+'
      this.loadReclamationData();
    });
  }

  loadReclamationData(): void {
    this.isLoadingData = true;
    this.reclamationService.getReclamationById(this.reclamationId).subscribe({
      next: (reclamation) => {
        // Patch form with reclamation data
        this.reclamationForm.patchValue({
          typeReclamation: reclamation.typeReclamation,
          description: reclamation.description,
          statut: reclamation.statut,
          dateResolution: reclamation.dateResolution
        });
        
        // If status is 'RESOLVED', ensure dateResolution is set to current date if not already set
        if (reclamation.statut === 'RESOLVED' && !reclamation.dateResolution) {
          this.reclamationForm.patchValue({
            dateResolution: new Date().toISOString()
          });
        }
        
        this.isLoadingData = false;
      },
      error: (error) => {
        console.error('Error fetching reclamation details:', error);
        this.isLoadingData = false;
        alert('Failed to load reclamation details. Please try again.');
      }
    });
  }

  // Convenience getter for easy access to form fields
  get f() { 
    return this.reclamationForm.controls; 
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.reclamationForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Prepare the update data
    const updateData = {
      ...this.reclamationForm.value
    };

    // If status changed to 'RESOLVED', set resolution date if not already set
    if (updateData.statut === 'RESOLVED' && !updateData.dateResolution) {
      updateData.dateResolution = new Date().toISOString();
    }
    
    // If status is not 'RESOLVED', clear resolution date
    if (updateData.statut !== 'RESOLVED') {
      updateData.dateResolution = null;
    }

    this.reclamationService.updateReclamation(this.reclamationId, updateData).subscribe({
      next: (response) => {
        this.loading = false;
        alert('Reclamation updated successfully!');
        this.router.navigate(['/admin/reclamations']);
      },
      error: (error) => {
        console.error('Error updating reclamation:', error);
        this.loading = false;
        
        if (error.error && error.error.message) {
          alert(`Error: ${error.error.message}`);
        } else {
          alert('An error occurred while updating the reclamation. Please try again.');
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/reclamations-list']);
  }
}