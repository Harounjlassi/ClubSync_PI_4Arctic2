import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { UserResponse } from '../models/user-response.model';
import { Sexe } from '../models/user.model';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  currentUser: UserResponse | null = null;
  isLoading = false;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  maxDate = new Date(); // For date picker (prevents future dates)
  defaultAvatar = 'assets/img/user.png';
  isLoggedIn = false;
  userEmail: string = '';
  showDropdown = false;
  private readonly baseUrl = 'http://localhost:8080'; // Replace with your actual API base URL

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.settingsForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]], // Optional for updates
      confirmPassword: [''],
      dateNaissance: ['', [Validators.required]],
      sexe: ['', [Validators.required]],
      numeroDeTelephone: ['', [Validators.required, Validators.pattern(/^\d{8,12}$/)]]
      // Removed photoProfil from form control as it's better handled separately
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
     // Hide preloader
     setTimeout(() => {
      const preloader = document.getElementById('preloader-active');
      if (preloader) {
        preloader.style.display = 'none';
      }
    }, 1000);

    // Check if user is logged in
    this.checkLoginStatus();

    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    
    // Check for valid token first
    const token = this.storageService.getToken();
    if (!token) {
      this.snackBar.open('No valid authentication token found. Please log in again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    // Get fresh data from API
    this.userService.getUserInfo().subscribe({
      next: (userData: UserResponse) => {
        try {
          console.log('User data loaded:', userData);
          
          // Ensure idUser is present
          if (!userData.idUser) {
            throw new Error('User ID is missing from response');
          }
          
          this.currentUser = userData;
          this.populateForm(userData);
          this.isLoading = false;
          
          // Set image preview if available
          if (userData.photoProfil) {
            this.imagePreview = this.getProfileImageUrl();
          }
        } catch (error) {
          console.error('Error parsing API user data:', error);
          this.snackBar.open('Error processing user data. Please try again later.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading user data:', err);
        this.snackBar.open('Failed to load user data. Please try again later.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
        
        // Try to get from storage as fallback
        const storedUser = this.storageService.getUser();
        if (storedUser && storedUser.idUser) {
          try {
            this.currentUser = storedUser as UserResponse;
            this.populateForm(this.currentUser);
            
            // Set image preview if available
            if (storedUser.photoProfil) {
              this.imagePreview = this.getProfileImageUrl();
            }
          } catch (error) {
            this.snackBar.open('Invalid user data. Please log in again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        }
      }
    });
  }

  populateForm(user: UserResponse): void {
    // Convert date string to date object for form
    let dateValue = '';
    if (user.dateNaissance) {
      try {
        // Handle different date formats
        const date = new Date(user.dateNaissance);
        if (!isNaN(date.getTime())) {
          dateValue = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }

    this.settingsForm.patchValue({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      dateNaissance: dateValue,
      sexe: user.sexe || 'Homme',
      numeroDeTelephone: user.numeroDeTelephone ? user.numeroDeTelephone.toString() : ''
    });
  }

  passwordMatchValidator(formGroup: FormGroup): { passwordMismatch: boolean } | null {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (password && confirmPassword && password.value && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      console.error('No file selected');
      return;
    }
    
    this.selectedFile = input.files[0];
    console.log('File selected:', this.selectedFile.name);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(this.selectedFile.type)) {
      this.snackBar.open('Please select an image (JPG, JPEG or PNG)', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.selectedFile = null;
      input.value = ''; // Reset the input
      return;
    }
    
    // Validate file size (max 2MB)
    if (this.selectedFile.size > 2 * 1024 * 1024) {
      this.snackBar.open('Image must not exceed 2MB', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.selectedFile = null;
      input.value = ''; // Reset the input
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      console.log('Image preview created');
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      this.snackBar.open('Error processing image', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    };
    reader.readAsDataURL(this.selectedFile);
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.settingsForm);
      this.snackBar.open('Please correct the errors in the form', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    if (!this.currentUser || !this.currentUser.idUser) {
      this.snackBar.open('No user data available. Please log in again.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.settingsForm.value;

    // Additional validations
    if (!formValue.firstname || !formValue.lastname) {
      this.snackBar.open('First name and last name are required', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.numeroDeTelephone || formValue.numeroDeTelephone === '0') {
      this.snackBar.open('Phone number is required', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validate date
    const dateObj = new Date(formValue.dateNaissance);
    const isValidDate = !isNaN(dateObj.getTime());
    if (!isValidDate) {
      this.snackBar.open('Please enter a valid date of birth', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

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
      id_role: number; // Always set to 2 (User role)
      password?: string; // Make password optional
    } = {
      firstname: formValue.firstname.trim(),
      lastname: formValue.lastname.trim(),
      email: formValue.email.trim(),
      dateNaissance: new Date(formValue.dateNaissance).toISOString().split('T')[0],
      sexe: formValue.sexe,
      numeroDeTelephone: Number(formValue.numeroDeTelephone),
      id_role: 2 // Always set to User role (2)
    };

    // Only include password if it was provided and not empty
    if (formValue.password && formValue.password.trim() !== '') {
      userRequest.password = formValue.password;
    }

    // Add the userRequest as a JSON string
    formData.append('userRequest', JSON.stringify(userRequest));
    
    // Add photo if selected
    if (this.selectedFile) {
      // Explicitly include filename to ensure proper processing on server
      formData.append('photo', this.selectedFile, this.selectedFile.name);
      console.log('File appended to form data:', this.selectedFile.name);
    }

    console.log('Sending update request with data:', userRequest);
    
    // Debug: Log formData contents
    console.log('FormData entries:');
    formData.forEach((value, key) => {
      console.log(key, ':', value instanceof File ? `File: ${value.name}` : value);
    });
    
    this.isLoading = true;
    this.userService.updateUser(this.currentUser.idUser, formData).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        this.isLoading = false;
        this.snackBar.open('Settings updated successfully!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        // Reset file input
        this.selectedFile = null;
        // Reload user data to reflect changes
        setTimeout(() => this.loadUserData(), 500);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Update error details:', err);
        
        let errorMessage = 'Error updating settings';
        
        // Try to extract more specific error messages
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.errors && err.error.errors.length > 0) {
            errorMessage = err.error.errors.join(', ');
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
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

  getProfileImageUrl(): string {
    const profileImage = this.currentUser?.photoProfil;
    
    if (!profileImage) {
      return this.defaultAvatar;
    }
    
    // Check if the photo path already starts with http:// or https://
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    // Check if path starts with '/'
    const path = profileImage.startsWith('/') ? profileImage : `/${profileImage}`;
    
    // Otherwise, prepend the base URL
    try {
      const fullUrl = `${this.baseUrl}${path}`;
      console.log('Profile image URL:', fullUrl);
      return fullUrl;
    } catch (error) {
      console.error('Error building profile image URL:', error);
      return this.defaultAvatar;
    }
  }

  // Form control getters for easier access in template
  get firstname() { return this.settingsForm.get('firstname'); }
  get lastname() { return this.settingsForm.get('lastname'); }
  get email() { return this.settingsForm.get('email'); }
  get password() { return this.settingsForm.get('password'); }
  get confirmPassword() { return this.settingsForm.get('confirmPassword'); }
  get dateNaissance() { return this.settingsForm.get('dateNaissance'); }
  get numeroDeTelephone() { return this.settingsForm.get('numeroDeTelephone'); }
  
  cancelChanges(): void {
    // Reset the form to original values
    if (this.currentUser) {
      this.populateForm(this.currentUser);
      this.imagePreview = this.getProfileImageUrl();
      this.selectedFile = null;
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/front']);
  }
  
   @HostListener('document:click', ['$event'])
     onDocumentClick(event: MouseEvent): void {
       const target = event.target as HTMLElement;
       const dropdown = document.querySelector('.user-dropdown-container');
       
       if (dropdown && !dropdown.contains(target) && this.showDropdown) {
         this.showDropdown = false;
       }
     }
   
     checkLoginStatus() {
       // Use the storage service to check login status
       this.isLoggedIn = this.storageService.isLoggedIn();
       
       if (this.isLoggedIn) {
         const user = this.userService.user || this.storageService.getUser();
         if (user) {
           this.userEmail = user.email;
         } else {
           // If user data is not available, fetch it from the API
           this.userService.getUserInfo().subscribe({
             next: (userResponse) => {
               this.userEmail = userResponse.email;
             },
             error: (err) => {
               console.error('Error fetching user info:', err);
             }
           });
         }
       }
     }
   
     navigateToLogin() {
       if (!this.isLoggedIn) {
         this.router.navigate(['/login']);
       }
     }
   
     toggleDropdown(event?: MouseEvent) {
       if (event) {
         event.stopPropagation(); // Prevent document click from immediately closing dropdown
       }
       this.showDropdown = !this.showDropdown;
     }
   
     closeDropdown() {
       this.showDropdown = false;
     }
   
     logout() {
       this.userService.logout().subscribe({
         next: () => {
           this.storageService.clean(); // Make sure to clear storage
           this.isLoggedIn = false;
           this.userEmail = '';
           this.closeDropdown();
           this.router.navigate(['/front']);
         },
         error: (err) => {
           console.error('Error during logout:', err);
           // Even if there's an error, we clean up local state
           this.storageService.clean();
           this.isLoggedIn = false;
           this.userEmail = '';
           this.closeDropdown();
           this.router.navigate(['/front']);
         }
       });
     }
   
     navigateToSettings() {
       this.closeDropdown();
       this.router.navigate(['/settings']);
     }
     navigateToRec() {
       this.closeDropdown();
       this.router.navigate(['/reclamationf']);
     }
}