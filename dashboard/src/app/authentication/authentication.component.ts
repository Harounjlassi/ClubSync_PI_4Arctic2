import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { StorageService } from '../services/storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

declare var google: any;

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {
  // Reactive form data
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(2)])
  });
  
  // Form status flags
  isLoggedIn = false;
  isLoginFailed = false;
  isLoading = false;
  errorMessage = '';
  roles: string[] = [];
  hidePassword = true; // For password visibility toggle

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    // Check if user is already logged in
    if (this.storageService.getUser()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
      this.redirectBasedOnRole(this.storageService.getUser().role);
    }

    // Initialize Google Sign-In
    google.accounts.id.initialize({
      client_id: "376533833455-qgcjilh1un1k0cfunakdab8b328a0p9f.apps.googleusercontent.com",
      callback: this.handleGoogleSignIn.bind(this)
    });
    
    // Render the Google Sign-In button
    google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "outline", size: "large" }
    );
  }

  // Form control getters for easier access in template
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  // Handle Google Sign-In response
  handleGoogleSignIn(response: any) {
    // Send the ID token to your backend
    this.isLoading = true;
    
    this.userService.loginWithGoogle(response.credential)
      .subscribe({
        next: (userData) => {
          this.storageService.saveUser(userData);
          this.isLoggedIn = true;
          this.isLoginFailed = false;
          
          this.snackBar.open('Google login successful!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          
          this.redirectBasedOnRole(userData.role);
        },
        error: (error) => {
          this.isLoginFailed = true;
          this.isLoading = false;
          this.errorMessage = error?.error?.message || 'Google authentication failed';
          
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  submitForm() {
    if (this.form.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
  
    this.userService
      .login({ 
        email: this.form.get('email')?.value, 
        password: this.form.get('password')?.value 
      })
      .subscribe({
        next: (response) => {
          // Assuming response contains a user object with a 'role' property
          const userRole = response.role; // Adjust based on your API response
      
          // Save user role or other necessary info to the storage
          this.storageService.saveUser(response);
          
          this.isLoggedIn = true;
          this.isLoginFailed = false;
          
          // Show success message
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          
          this.redirectBasedOnRole(userRole);
        },
        error: (error) => {
          // Handle login failure
          this.isLoginFailed = true;
          this.isLoading = false;
          this.errorMessage = error?.error?.message || 'Invalid credentials';
          
          // Show error message
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  redirectBasedOnRole(role: string) {
    if (role === 'Admin') {
      console.log('Admin role detected');
      this.router.navigate(['dashboard']);
    } else if (role === 'User') {
      console.log('User role detected');
      this.router.navigate(['/front']);
    }
  }
  
  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}