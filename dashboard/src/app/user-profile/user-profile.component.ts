import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, Sexe } from '../models/user.model';
import { UserService } from '../services/user.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  currentUser: any = null;
  loading = true;
  error = '';
  defaultAvatar = 'assets/img/user.png'; // Update this path to match your actual assets

  constructor(
    private userService: UserService,
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    // First try to use the token data
    const tokenUser = this.userService.user;
    
    if (tokenUser) {
      console.log('Using token user data:', tokenUser);
      this.currentUser = tokenUser;
      
      // If the token data doesn't have all the fields we expect,
      // we'll try to enrich it with the user info API
      this.tryEnrichUserData();
    } else {
      // If no token data, try to get user info from API
      this.loadUserData();
    }
  }

  tryEnrichUserData() {
    // Only attempt to get additional data if we already have basic user info
    this.userService.getUserInfo().subscribe({
      next: (userData) => {
        console.log('Enriched user data loaded:', userData);
        // Merge the new data with existing data
        this.currentUser = { ...this.currentUser, ...userData };
        this.loading = false;
      },
      error: (err) => {
        console.warn('Could not load additional user data:', err);
        // We already have basic user data, so just proceed
        this.loading = false;
      }
    });
  }

  loadUserData() {
    this.loading = true;
    
    this.userService.getUserInfo().subscribe({
      next: (userData) => {
        console.log('User data loaded:', userData);
        this.currentUser = userData;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user data:', err);
        
        // If we have a token-based user as fallback
        if (this.userService.user) {
          this.currentUser = this.userService.user;
          console.log('Falling back to token data:', this.currentUser);
          this.loading = false;
        } else {
          this.error = 'Failed to load user data. Please try again later.';
          this.loading = false;
        }
      }
    });
  }

  // Helper method to safely access nested properties
  getProperty(obj: any, path: string, defaultValue: any = 'Not provided'): any {
    return path.split('.').reduce((o, p) => (o ? o[p] : defaultValue), obj);
  }

  // Logout method
  logout() {
    this.loading = true;
    
    this.userService.logout().subscribe({
      next: () => {
        this.handleLogoutSuccess();
      },
      error: (err) => {
        console.error('Error during logout API call:', err);
        // Even if the API call fails, we still want to clear local data
        this.handleLogoutSuccess();
      }
    });
  }

  private handleLogoutSuccess() {
    // Clear the token from localStorage
    localStorage.removeItem(this.userService['TOKEN_NAME']);
    this.storageService.clean();
    // Update the login state in the service
    this.userService['_isLoggedIn$'].next(false);
    
    // Clear the user data from the service
    this.userService.user = null;
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }
}