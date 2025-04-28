// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private authService: UserService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {
    // Get email and token from session storage
    this.email = sessionStorage.getItem('resetEmail') || '';
    this.token = sessionStorage.getItem('resetToken') || '';
    
    if (!this.email || !this.token) {
      // Redirect to forgot password if email or token not found
      this.router.navigate(['/forgot-password']);
    }
  }

  // Custom validator to check if password and confirm password match
  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { notMatching: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const newPassword = this.resetForm.get('password')?.value;
    
    this.authService.resetPassword(this.email, this.token, newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Password reset successful';
        
        // Clear session storage
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetToken');
        
        // Navigate to login page after a short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Failed to reset password. Please try again.';
      }
    });
  }
}