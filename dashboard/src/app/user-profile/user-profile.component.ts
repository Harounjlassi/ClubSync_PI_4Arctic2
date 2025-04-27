import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { User, Sexe } from '../models/user.model';
import { UserService } from '../services/user.service';
import { StorageService } from '../services/storage.service';
import { Role, RoleType } from '../models/role.model';
import { UserEditDialogComponent } from '../user-edit-dialog/user-edit-dialog.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  currentUser: any = null;
  loading = true;
  error = '';
  defaultAvatar = 'assets/img/user.png';
  private readonly baseUrl = 'http://localhost:8080'; // Replace with your actual API base URL

  constructor(
    private userService: UserService,
    private router: Router,
    private storageService: StorageService,
    private dialog: MatDialog
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

    // Get fresh data from API
    this.userService.getUserInfo().subscribe({
      next: (userData: any) => {
        try {
          console.log('User data loaded:', userData);
          this.currentUser = userData;
          this.loading = false;
        } catch (error) {
          console.error('Error parsing API user data:', error);
          this.error = 'Error processing user data. Please try again later.';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading user data:', err);
        // Try to get from storage as fallback
        const storedUser = this.storageService.getUser();
        if (storedUser) {
          try {
            this.currentUser = storedUser;
          } catch (error) {
            this.error = 'Invalid user data. Please log in again.';
          }
        } else {
          this.error = 'Failed to load user data. Please try again later.';
        }
        this.loading = false;
      }
    });
  }

  getRoleName(): string {
    if (!this.currentUser?.role) return 'User';
    
    // Handle string role from the API response
    if (typeof this.currentUser.role === 'string') {
      return this.currentUser.role;
    }
    
    // Check if role is an array
    if (Array.isArray(this.currentUser.role)) {
      const roleType = this.currentUser.role[0]; 
      return roleType === RoleType.ADMIN ? 'ADMIN' : 'N/A';
    }
    
    return typeof this.currentUser.role === 'object' && this.currentUser.role.roleType === RoleType.ADMIN ? 'ADMIN' : 'N/A';
  }

  getGenderDisplay(): string {
    const gender = this.currentUser?.sexe;
    
    if (!gender) return 'Not specified';
    
    // Handle string gender from the API response
    if (typeof gender === 'string') {
      return gender === 'HOMME' ? 'Male' : 
             gender === 'FEMME' ? 'Female' : 
             'Not specified';
    }
    
    // Handle enum gender
    switch(gender) {
      case Sexe.HOMME: return 'Male';
      case Sexe.FEMME: return 'Female';
      default: return 'Not specified';
    }
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
    
    // Otherwise, prepend the base URL
    try {
      const fullUrl = `${this.baseUrl}${profileImage}`;
      console.log('Profile image URL:', fullUrl);
      return fullUrl;
    } catch (error) {
      console.error('Error building profile image URL:', error);
      return this.defaultAvatar;
    }
  }

  formatDate(date: any): string {
    if (!date) return 'Not provided';
    
    try {
      // Handle timestamp (milliseconds since epoch)
      if (typeof date === 'number') {
        return new Date(date).toLocaleDateString();
      }
      
      // Handle ISO string
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
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
    console.log('Opening edit dialog for user ID:', userId);
    
    if (!userId || !this.currentUser) {
      console.error('User ID or current user data is missing!');
      return;
    }
    
    // Open edit dialog with current user data
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '800px',
      disableClose: true,
      data: { user: this.currentUser }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User updated successfully');
        // Reload the user data to reflect the changes
        this.loadUserData();
      }
    });
  }
  
  private handleLogoutSuccess() {
    this.storageService.clean();
    this.userService['_isLoggedIn$'].next(false);
    this.router.navigate(['/login']);
  }
}