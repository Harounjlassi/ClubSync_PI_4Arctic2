import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, Sexe } from '../models/user.model';
import { UserResponse } from '../models/user-response.model';
import { UserService } from '../services/user.service';
import { StorageService } from '../services/storage.service';
import { Role, RoleType } from '../models/role.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  currentUser: UserResponse | null = null;
  loading = true;
  error = '';
  defaultAvatar = 'assets/img/user.png';

  constructor(
    private userService: UserService,
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.loading = true;
    
    // Check for valid token first
    const token = this.storageService.getToken();
    if (!token) {
      this.error = 'No valid authentication token found. Please log in again.';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }
    
    // Try to get from storage first
    const storedUser = this.storageService.getUser();
    if (storedUser) {
      try {
        this.currentUser = new UserResponse(storedUser);
        this.loading = false;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Don't set currentUser if there's a parsing error
        this.loading = false;
      }
    }

    // Then get fresh data from API
    this.userService.getUserInfo().subscribe({
      next: (userData: any) => {
        try {
          this.currentUser = new UserResponse(userData);
          this.loading = false;
        } catch (error) {
          console.error('Error parsing API user data:', error);
          this.error = 'Error processing user data. Please try again later.';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading user data:', err);
        if (!this.currentUser && storedUser) {
          // Only use stored data as fallback if parsing didn't fail earlier
          try {
            this.currentUser = new UserResponse(storedUser);
          } catch (error) {
            this.error = 'Invalid user data. Please log in again.';
          }
        } else if (!this.currentUser) {
          this.error = 'Failed to load user data. Please try again later.';
        }
        this.loading = false;
      }
    });
  }

  getRoleName(): string {
    if (!this.currentUser?.role) return 'Standard User';
    
    // Handle both Role object and RoleType string
    const roleType = typeof this.currentUser.role === 'string' 
      ? this.currentUser.role 
      : this.currentUser.role.roleType;
    
    return roleType === RoleType.ADMIN ? 'Admin' : 'Standard User';
  }

  getGenderDisplay(): string {
    switch(this.currentUser?.sexe) {
      case Sexe.HOMME: return 'Male';
      case Sexe.FEMME: return 'Female';
      default: return 'Not specified';
    }
  }

  logout() {
    this.loading = true;
    this.userService.logout().subscribe({
      next: () => this.handleLogoutSuccess(),
      error: () => this.handleLogoutSuccess()
    });
  }
  onEdit(userId: number): void {
    
console.log('USER ID:', userId); // DOIT être un number

if (userId) {
  this.router.navigate(['/users/edit', userId]);
} else {
  console.error('User ID is missing!');
}
  }
  private handleLogoutSuccess() {
    this.storageService.clean();
    this.userService['_isLoggedIn$'].next(false);
    this.router.navigate(['/login']);
  }
}