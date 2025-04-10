import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/services/user.service';
import { StorageService } from 'app/services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-comps',
  templateUrl: './test-comps.component.html',
  styleUrls: ['./test-comps.component.scss']
})
export class TestCompsComponent implements OnInit {
  content?: string;
  userName?: string;
  isLoading = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Check if user is logged in first
    if (this.storageService.isLoggedIn()) {
      // Set username for display
      const user = this.storageService.getUser();
      this.userName = user?.name || user?.email || 'User';
      
      // Fetch the content from the secured route
      this.fetchTestCompContent();
    } else {
      // Redirect to login if not authenticated
      this.redirectToLogin();
    }
  }

  fetchTestCompContent(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Calling the AuthService method that makes the API request with JWT token
    this.userService.getUserBoard().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.content = response; // Save the response
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Failed to load content.';
        console.error('Error loading content:', error);
        
        if (error.status === 403) {
          this.logout(); // If the error is related to authentication
        }
      }
    });
  }

  logout(): void {
    // Call logout API
    this.userService.logout().subscribe({
      next: () => {
        this.performLogout();
      },
      error: () => {
        // Even if API fails, clear local storage
        this.performLogout();
      }
    });
  }

  private performLogout(): void {
    this.storageService.clean();
    this.redirectToLogin();
  }

  private redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
