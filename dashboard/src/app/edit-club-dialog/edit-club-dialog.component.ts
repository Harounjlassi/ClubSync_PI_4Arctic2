import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClubService } from '../services/club.service';
import { Club } from '../models/club.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-club-dialog',
  templateUrl: './edit-club-dialog.component.html',
  styleUrls: ['./edit-club-dialog.component.css']
})
export class EditClubDialogComponent implements OnInit {
  clubForm: FormGroup;
  isSubmitting = false;
  categories: string[] = ['Sport', 'Art', 'Culture', 'Musique', 'Technologie', 'Science', 'Littérature', 'Autre'];
  logoFile: File = null;
  logoPreview: string | ArrayBuffer = null;

  constructor(
    private fb: FormBuilder,
    private clubService: ClubService,
    public dialogRef: MatDialogRef<EditClubDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { club: Club },
    private snackBar: MatSnackBar
  ) {
    // Ajouter les nouveaux champs (logo, slogan, categorie) au formulaire
    this.clubForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.pattern('^[a-zA-ZÀ-ÿ\\s\'-]+$'), // Pattern pour n'accepter que des lettres, espaces, apostrophes et tirets
        Validators.minLength(3),
        Validators.maxLength(50),
        this.noConsecutiveSpaces



      ]], 
      description: ['', [
        Validators.required,
        Validators.minLength(10), // Minimum 10 characters for description
        Validators.maxLength(500),
        this.noConsecutiveSpaces

      ]],
      logo: ['', [Validators.required]],  // Nouveau champ
      slogan: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
        this.noConsecutiveSpaces

      ]],       categorie: ['', [Validators.required]]  // Nouveau champ
    });
  }

  ngOnInit(): void {
    // Peupler les champs du formulaire avec les données existantes du club
    this.clubForm.patchValue({
      name: this.data.club.name,
      description: this.data.club.description,
      logo: this.data.club.logo,       // Peupler le champ logo
      slogan: this.data.club.slogan,   // Peupler le champ slogan
      categorie: this.data.club.categorie  // Peupler le champ categorie
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Valider le type de fichier
      if (!file.type.includes('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }
      
      // Lire le fichier comme une URL data pour obtenir le base64
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
        // Stocker la chaîne base64 dans le formulaire
        this.clubForm.patchValue({
          logo: reader.result.toString()
        });
        this.clubForm.get('logo').markAsTouched();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.clubForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const updatedClub: Club = {
        ...this.data.club,
        ...this.clubForm.value
      };

      this.clubService.updateClub(updatedClub).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
          this.showSuccessNotification();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.snackBar.open('Échec de la mise à jour', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        },
        complete: () => this.isSubmitting = false
      });
    }
  }

  private showSuccessNotification(): void {
    this.snackBar.open('✅ Modification réussie !', 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
    // Validation personnalisée pour éviter les espaces multiples consécutifs
  noConsecutiveSpaces(control: FormControl): {[key: string]: any} | null {
    const value = control.value || '';
    if (value.includes('  ')) {
      return { 'consecutiveSpaces': true };
    }
    return null;
  }
}
