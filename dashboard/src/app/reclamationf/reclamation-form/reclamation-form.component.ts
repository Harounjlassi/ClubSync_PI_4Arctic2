import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReclamationService } from '../../services/reclamation.service';
import { ReclamationType } from '../../models/reclamation.model';
import { UserService } from '../../services/user.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-reclamation-form',
  templateUrl: './reclamation-form.component.html',
  styleUrls: ['./reclamation-form.component.scss']
})
export class ReclamationFormComponent implements OnInit {
  reclamationForm: FormGroup;
  submitted = false;
  loading = false;
  reclamationTypes = Object.values(ReclamationType);
  isLoggedIn = false;
  userEmail: string = '';
  showDropdown = false;
  userId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private reclamationService: ReclamationService,
    private router: Router,
    private userService: UserService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    // Hide preloader if exists
    setTimeout(() => {
      const preloader = document.getElementById('preloader-active');
      if (preloader) {
        preloader.style.display = 'none';
      }
    }, 1000);

    // Check if user is logged in
    this.checkLoginStatus();

    // Initialize form with validators
    this.reclamationForm = this.formBuilder.group({
      typeReclamation: ['', Validators.required],
      description: ['', [
        Validators.required, 
        Validators.minLength(20), 
        Validators.maxLength(500)
      ]]
    });
  }
  
  // Close dropdown when clicking outside
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
        this.userId = user.idUser;
      } else {
        // If user data is not available, fetch it from the API
        this.userService.getUserInfo().subscribe({
          next: (userResponse) => {
            this.userEmail = userResponse.email;
            this.userId = userResponse.idUser;
          },
          error: (err) => {
            console.error('Error fetching user info:', err);
            // If we can't get user info, assume not logged in
            this.isLoggedIn = false;
            this.router.navigate(['/login']);
          }
        });
      }
    } else {
      // If not logged in, redirect to login page
      this.router.navigate(['/login']);
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
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
        this.storageService.clean(); // Clear storage
        this.isLoggedIn = false;
        this.userEmail = '';
        this.closeDropdown();
        this.router.navigate(['/front']);
      },
      error: (err) => {
        console.error('Error during logout:', err);
        // Even if there's an error, clean up local state
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
    this.router.navigate(['/reclamationf']); // Route for viewing user's reclamations
  }

  viewMyReclamations() {
    this.router.navigate(['reclamationsview']);
  }

  // Convenience getter for easy access to form fields
  get f() { 
    return this.reclamationForm.controls; 
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.reclamationForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Create a complete reclamation object with default values for required fields
    const reclamationData = {
      ...this.reclamationForm.value,
      dateReclamation: new Date().toISOString(), // Current date and time
      statut: 'IN_PROGRESS', // Default status as requested
      dateResolution: null // No resolution date initially
    };
    
    this.reclamationService.createReclamation(reclamationData).subscribe({
      next: (response) => {
        this.loading = false;
        alert('Your reclamation has been submitted successfully!');
        this.router.navigate(['/user/reclamations']);
      },
      error: (error) => {
        console.error('Error submitting reclamation:', error);
        this.loading = false;
        
        if (error.error && error.error.message) {
          alert(`Error: ${error.error.message}`);
        } else {
          alert('An error occurred while submitting your reclamation. Please try again.');
        }
      }
    });
  }

  reset(): void {
    this.submitted = false;
    this.reclamationForm.reset();
  }
}