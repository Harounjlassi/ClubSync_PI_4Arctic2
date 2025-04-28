// verify-code.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../services/user.service';

@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.scss']
})
export class VerifyCodeComponent implements OnInit {
  verifyForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  email = '';

  constructor(
    private fb: FormBuilder,
    private authService: UserService,
    private router: Router
  ) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get email from session storage
    this.email = sessionStorage.getItem('resetEmail') || '';
    if (!this.email) {
      // Redirect to forgot password if email not found
      this.router.navigate(['/forgot-password']);
    }
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const code = this.verifyForm.get('code')?.value;
    
    this.authService.verifyCode(this.email, code).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Store token for the final reset step
        sessionStorage.setItem('resetToken', response.token);
        this.router.navigate(['/reset-password']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Invalid or expired verification code';
      }
    });
  }

  resendCode(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Failed to resend code';
      }
    });
  }
}