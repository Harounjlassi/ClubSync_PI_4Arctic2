import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-register-dialog',
  templateUrl: './user-register-dialog.component.html',
  styleUrls: ['./user-register-dialog.component.css']
})
export class UserRegisterDialogComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  maxDate = new Date(); // For date picker (prevents future dates)
  roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserRegisterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
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
      id_role: [2, [Validators.required]],
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
        this.snackBar.open('Please select an image (JPG, JPEG or PNG)', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.selectedFile = null;
        this.imagePreview = null;
        return;
      }
      
      // Validate file size (max 2MB)
      if (this.selectedFile.size > 2 * 1024 * 1024) {
        this.snackBar.open('Image must not exceed 2MB', 'Close', {
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
      this.snackBar.open('Please correct the errors in the form', 'Close', {
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
      id_role: Number(formValue.id_role),
      photoProfil: this.selectedFile
    };

    this.isLoading = true;
    this.userService.register(userRequest).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('User registered successfully!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true); // Close with success result
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err?.error?.message || 'Error during registration';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error('Registration error:', err);
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
  
  onCancel(): void {
    this.dialogRef.close(false);
  }
}