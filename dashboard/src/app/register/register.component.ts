import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  maxDate = new Date(); // For date picker (prevents future dates)

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Initialize form with validators
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      dateNaissance: ['', [Validators.required]],
      sexe: ['Homme', [Validators.required]],
      numeroDeTelephone: ['', [Validators.required, Validators.pattern(/^\d{8,12}$/)]],
      photoProfil: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  // Custom validator for password matching
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(this.selectedFile.type)) {
        this.snackBar.open('Veuillez sélectionner une image (JPG, JPEG ou PNG)', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.selectedFile = null;
        this.imagePreview = null;
        return;
      }
      
      // Validate file size (max 2MB)
      if (this.selectedFile.size > 2 * 1024 * 1024) {
        this.snackBar.open('L\'image ne doit pas dépasser 2MB', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.selectedFile = null;
        this.imagePreview = null;
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.registerForm);
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.registerForm.value;

    const userRequest = {
      firstname: formValue.firstname,
      lastname: formValue.lastname,
      email: formValue.email,
      password: formValue.password,
      dateNaissance: new Date(formValue.dateNaissance).toISOString(),
      sexe: formValue.sexe,
      numeroDeTelephone: Number(formValue.numeroDeTelephone),
      id_role: 2, // Automatically set role to "User" (assuming user role id is 2)
      photoProfil: this.selectedFile // Now passing the File object directly
    };

    this.isLoading = true;
    this.userService.register(userRequest).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Inscription réussie! Vous pouvez maintenant vous connecter.', 'Fermer', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err?.error?.message || 'Erreur lors de l\'enregistrement';
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error('Erreur lors de l\'enregistrement :', err);
      }
    });
  }

  // Helper method to mark all controls in a form group as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Form control getters for easier access in template
  get firstname() { return this.registerForm.get('firstname'); }
  get lastname() { return this.registerForm.get('lastname'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get dateNaissance() { return this.registerForm.get('dateNaissance'); }
  get numeroDeTelephone() { return this.registerForm.get('numeroDeTelephone'); }
  
  // Navigate back to login
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}