import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { StorageService } from '../services/storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoleType } from '../models/role.model';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';

declare var google: any;

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit, OnDestroy {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement>;
  
  isLoggedIn = false;
  isLoginFailed = false;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  
  // Face login properties
  showFaceCapture = false;
  stream: MediaStream | null = null;

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const storedUser = this.storageService.getUser();
    if (storedUser) {
      this.isLoggedIn = true;
      this.redirectBasedOnRole(storedUser.role);
    }

    this.initializeGoogleSignIn();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  private initializeGoogleSignIn(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '376533833455-qgcjilh1un1k0cfunakdab8b328a0p9f.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleSignIn(response)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large' }
      );
    }
  }

  handleGoogleSignIn(response: any): void {
    this.isLoading = true;

    this.userService.loginWithGoogle(response.credential).subscribe({
      next: (res) => this.handleLoginSuccess(res),
      error: (error) => this.handleLoginError(error)
    });
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.userService.login({
      email: this.email?.value || '',
      password: this.password?.value || ''
    }).subscribe({
      next: (res) => this.handleLoginSuccess(res),
      error: (error) => this.handleLoginError(error)
    });
  }

  // Face login methods
  startFaceLogin(): void {
    this.showFaceCapture = true;
    this.startCamera();
  }

  async startCamera(): Promise<void> {
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      this.showSnackbar('Camera access denied or not available', 'error-snackbar');
      this.showFaceCapture = false;
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.videoElement && this.videoElement.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  cancelFaceCapture(): void {
    this.stopCamera();
    this.showFaceCapture = false;
  }

  captureFace(): void {
    if (!this.videoElement || !this.videoElement.nativeElement) {
      this.showSnackbar('Video element not found', 'error-snackbar');
      return;
    }

    this.isLoading = true;

    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and submit
      canvas.toBlob(blob => {
        if (blob) {
          this.submitFaceLogin(blob);
        } else {
          this.isLoading = false;
          this.showSnackbar('Failed to capture image', 'error-snackbar');
        }
      }, 'image/jpeg', 0.95);
    }
  }

  submitFaceLogin(imageBlob: Blob): void {
    // Check if email is provided
    if (!this.email?.value) {
      this.showSnackbar('Please enter your email before using face login', 'error-snackbar');
      this.isLoading = false;
      this.stopCamera();
      this.showFaceCapture = false;
      return;
    }
  
    const formData = new FormData();
    formData.append('image', imageBlob, 'face-login.jpg');
    formData.append('email', this.email.value); // Add email to the form data
  
    // Use our service instead of direct http call
    this.userService.loginWithFace(imageBlob, this.email.value)
      .subscribe({
        next: (response: any) => {
          this.stopCamera();
          this.showFaceCapture = false;
          this.handleLoginSuccess(response);
        },
        error: (error) => {
          this.isLoading = false;
          this.handleLoginError(error);
          this.stopCamera();
          this.showFaceCapture = false;
        }
      });
  }
  

  private handleLoginSuccess(response: any): void {
    const user: User = {
      email: response.email,
      firstname: response.firstname,
      lastname: response.lastname,
      sexe: response.gender,
      dateNaissance: new Date(response.birthDate),
      role: response.role
    };

    this.storageService.saveAuthData({
      token: response.token,
      user: user
    });

    this.isLoggedIn = true;
    this.isLoginFailed = false;
    this.isLoading = false;

    this.showSnackbar('Login successful!', 'success-snackbar');
    this.redirectBasedOnRole(user.role);
  }

  private handleLoginError(error: any): void {
    this.isLoginFailed = true;
    this.isLoading = false;
    this.errorMessage = error?.error?.message || error?.message || 'Authentication failed. Please try again.';
    this.showSnackbar(this.errorMessage, 'error-snackbar');
  }

  private showSnackbar(message: string, panelClass: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  redirectBasedOnRole(role: any): void {
    const roleString = typeof role === 'object' && 'roleType' in role ? role.roleType : role;
    console.log('Redirecting based on role:', roleString);

    if (roleString === RoleType.ADMIN || roleString === 'ADMIN') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/front']);
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}