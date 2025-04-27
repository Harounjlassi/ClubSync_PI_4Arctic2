import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';
import { UserResponse } from '../models/user-response.model';
import { Sexe } from '../models/user.model';
import { Role, RoleType } from '../models/role.model';

@Component({
  selector: 'app-user-edit-dialog',
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.css']
})
export class UserEditDialogComponent implements OnInit {
  // Make these properties public so they're accessible in the template
  public editForm: FormGroup;
  public isLoading = false;
  public hidePassword = true;
  public hideConfirmPassword = true;
  public imagePreview: string | ArrayBuffer | null = null;
  public selectedFile: File | null = null;
  public maxDate = new Date(); // For date picker (prevents future dates)
  public roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' }
  ];
  public userId: number;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserResponse }
  ) {
    this.userId = data.user.idUser;
    
    // Initialize form with user data
    this.editForm = this.fb.group({
      firstname: [data.user.firstname || '', [Validators.required, Validators.minLength(2)]],
      lastname: [data.user.lastname || '', [Validators.required, Validators.minLength(2)]],
      email: [data.user.email || '', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]], // Optional for updates
      confirmPassword: [''],
      dateNaissance: [data.user.dateNaissance ? new Date(data.user.dateNaissance) : '', [Validators.required]],
      sexe: [data.user.sexe || 'Homme', [Validators.required]],
      numeroDeTelephone: [data.user.numeroDeTelephone || '', [Validators.required, Validators.pattern(/^\d{8,12}$/)]],
      id_role: [this.getRoleId(data.user), [Validators.required]],
      photoProfil: ['']
    }, { validators: this.passwordMatchValidator });

    // Set the image preview if available
    if (data.user.photoProfil) {
      this.imagePreview = data.user.photoProfil;
    }
  }

  ngOnInit(): void {}

  // Helper to get role ID from user data
  private getRoleId(user: UserResponse): number {
    if (!user.role) {
      return 2; // Default to User role
    }
    
    if (Array.isArray(user.role)) {
      // For role as array, assuming format from API
      return user.role.includes('ADMIN') ? 1 : 2;
    } else if (typeof user.role === 'object') {
      // Using 'as' to avoid TypeScript errors
      const roleObj = user.role as { roleType: RoleType };
      return roleObj.roleType === RoleType.ADMIN ? 1 : 2;
    } else if (typeof user.role === 'string') {
      // For role as string
      return user.role.toUpperCase() === 'ADMIN' ? 1 : 2;
    }
    
    return 2; // Default to User
  }

  // Custom validator for password matching
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value && password.value !== confirmPassword.value) {
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
        return;
      }
      
      // Validate file size (max 2MB)
      if (this.selectedFile.size > 2 * 1024 * 1024) {
        this.snackBar.open('Image must not exceed 2MB', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.selectedFile = null;
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.editForm);
      this.snackBar.open('Please correct the errors in the form', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.editForm.value;

    // Create FormData object for multipart request
    const formData = new FormData();
    
    // Create user request object
     const userRequest: {
    firstname: string;
    lastname: string;
    email: string;
    dateNaissance: string;
    sexe: string;
    numeroDeTelephone: number;
    id_role: number;
    password?: string; // Make password optional
  } = {
    firstname: formValue.firstname,
    lastname: formValue.lastname,
    email: formValue.email,
    dateNaissance: new Date(formValue.dateNaissance).toISOString().split('T')[0],
    sexe: formValue.sexe,
    numeroDeTelephone: Number(formValue.numeroDeTelephone),
    id_role: Number(formValue.id_role)
  };

  // Only include password if it was provided
  if (formValue.password) {
    userRequest.password = formValue.password;
  }

    // Add the userRequest as a JSON string
    formData.append('userRequest', JSON.stringify(userRequest));
    
    // Add photo if selected
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.isLoading = true;
    this.userService.updateUser(this.userId, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('User updated successfully!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true); // Close with success result
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err?.error?.message || 'Error updating user';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error('Update error:', err);
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
  get firstname() { return this.editForm.get('firstname'); }
  get lastname() { return this.editForm.get('lastname'); }
  get email() { return this.editForm.get('email'); }
  get password() { return this.editForm.get('password'); }
  get confirmPassword() { return this.editForm.get('confirmPassword'); }
  get dateNaissance() { return this.editForm.get('dateNaissance'); }
  get numeroDeTelephone() { return this.editForm.get('numeroDeTelephone'); }
  
  onCancel(): void {
    this.dialogRef.close(false);
  }
}