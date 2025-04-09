import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {
  loginForm: FormGroup;
  verificationForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  showVerificationForm = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    // Initialize login form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Initialize verification form
    this.verificationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    this.checkLoggedInStatus();
  }

  checkLoggedInStatus(): void {
    // You can implement a token check or session check here
    // If user is already logged in, redirect to dashboard
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const loginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.userService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Check if verification is required
        if (response.requiresVerification) {
          this.successMessage = 'Please verify your account with the code sent to your email.';
          this.showVerificationForm = true;
          this.verificationForm.patchValue({ email: loginRequest.email });
        } else {
          // Handle successful login
          this.handleSuccessfulLogin(response);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
      }
    });
  }

  onVerify(): void {
    if (this.verificationForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const verifyRequest = {
      email: this.verificationForm.get('email')?.value,
      code: this.verificationForm.get('code')?.value
    };

    this.userService.verifyCode(verifyRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.handleSuccessfulLogin(response);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Verification failed. Please try again.';
        console.error('Verification error:', error);
      }
    });
  }

  handleSuccessfulLogin(response: any): void {
    // Save token to localStorage
    localStorage.setItem('token', response.token);
    
    // Save user info if available
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    this.successMessage = 'Login successful! Redirecting...';
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  forgotPassword(): void {
    // Implement forgot password functionality
    // This could open a dialog or navigate to a password reset page
    alert('Forgot password feature coming soon!');
  }
}