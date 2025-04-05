import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ClubService } from '../services/club.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-club-dialog',
  templateUrl: './add-club-dialog.component.html',
  styleUrls: ['./add-club-dialog.component.css']
})
export class AddClubDialogComponent implements OnInit {
  clubForm: FormGroup;
  categories: string[] = ['Sport', 'Art', 'Culture', 'Musique', 'Technologie', 'Science', 'Littérature', 'Autre'];
  logoFile: File = null;
  logoPreview: string | ArrayBuffer = null;
  isSubmitting: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private clubService: ClubService,
    public dialogRef: MatDialogRef<AddClubDialogComponent>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.clubForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      logo: ['', Validators.required],
      slogan: ['', Validators.required],
      categorie: ['', Validators.required]
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
      
      this.clubService.addClub(this.clubForm.value).subscribe({
        next: (result) => {
          // Ferme la popup en renvoyant le résultat
          this.dialogRef.close(result);
          this.showSuccessNotification();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du club:', error);
          this.snackBar.open('Échec de l\'ajout du club', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        },
        complete: () => this.isSubmitting = false
      });
    }
  }

  private showSuccessNotification(): void {
    this.snackBar.open('✅ Club ajouté avec succès !', 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}