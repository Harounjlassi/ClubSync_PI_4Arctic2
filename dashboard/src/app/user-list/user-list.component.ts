import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserResponse } from '../models/user-response.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { UserRegisterDialogComponent } from '../user-register-dialog/user-register-dialog.component';
import { Observable, finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from 'app/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];
  loading = true;
  apiStatus = 'Pending';
  selectedRoleFilter = 'all'; // Default to showing all users

  constructor(
    private userService: UserService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    document.querySelector('.fixed-plugin')?.remove();
  }

  getJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  // Stats methods
  getAdminCount(): number {
    return this.users.filter(user => this.isAdmin(user)).length;
  }

  getUserCount(): number {
    return this.users.filter(user => !this.isAdmin(user)).length;
  }

  getBannedCount(): number {
    return this.users.filter(user => user.archived).length;
  }

  openRegisterDialog(): void {
    const dialogRef = this.dialog.open(UserRegisterDialogComponent, {
      width: '800px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If the dialog returns true, it means user was successfully registered
        this.loadUsers(); // Reload the user list to include the new user
      }
    });
  }

  private loadUsers(): void {
    this.loading = true;
    this.apiStatus = 'Loading...';
    
    console.log('Fetching users from API...');
    
    this.userService.getAllUsers()
    .pipe(
      finalize(() => {
        this.loading = false;
        this.changeDetector.detectChanges();
      })
    )
    .subscribe({
      next: (data: any) => {
        console.log('Raw API response:', data);
        console.log('Response type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        
        if (data) {
          console.log('Keys in response:', Object.keys(data));
          console.log('Sample of first item (if applicable):', 
            Array.isArray(data) && data.length > 0 ? data[0] : 
            data.content && Array.isArray(data.content) && data.content.length > 0 ? data.content[0] : 
            null
          );
        }
        
        // Process data as before
        if (!Array.isArray(data) && data.content && Array.isArray(data.content)) {
          this.users = data.content;
        } else {
          this.users = Array.isArray(data) ? data : [];
        }
        
        console.log('Processed users array:', this.users);
        console.log('User count:', this.users.length);
        this.apiStatus = `Success: ${this.users.length} users loaded`;
        
        // Apply initial filters
        this.applyFilters();
        
        this.changeDetector.detectChanges();
        setTimeout(() => {
          console.log('Force refresh triggered');
          this.changeDetector.detectChanges();
        }, 100);
      }
    });
  }

  applyFilters(): void {
    // Start with all users
    let result = [...this.users];
    
    // Apply role filter if not "all"
    if (this.selectedRoleFilter !== 'all') {
      result = result.filter(user => {
        const role = this.getRole(user).toLowerCase();
        return role.includes(this.selectedRoleFilter.toLowerCase());
      });
    }
    
    this.filteredUsers = result;
    console.log(`Filter applied: ${this.selectedRoleFilter}. Showing ${this.filteredUsers.length} users.`);
    this.changeDetector.detectChanges();
  }

  clearFilters(): void {
    this.selectedRoleFilter = 'all';
    this.applyFilters();
  }

  isAdmin(user: User | UserResponse): boolean {
    const role = this.getRole(user).toLowerCase();
    return role.includes('admin');
  }

  onEdit(userId: number): void {
    console.log('Navigating to edit user:', userId);
    this.router.navigate(['/users/edit', userId]);
  }

  onToggleBan(user: UserResponse): void {
    const isBanned = user.archived;
    const dialogTitle = isBanned ? 'Unban User' : 'Ban User';
    const dialogMessage = isBanned 
      ? `Are you sure you want to unban ${user.firstname} ${user.lastname}?` 
      : `Are you sure you want to ban ${user.firstname} ${user.lastname}?`;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { title: dialogTitle, message: dialogMessage }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optimistically update the UI
        user.archived = !isBanned;
        
        // Call the appropriate service method
        const action$: Observable<void | string> = isBanned
          ? this.userService.restoreUser(user.idUser)
          : this.userService.archiveUser(user.idUser);
        
        action$.subscribe({
          next: () => {
            console.log(`User ${isBanned ? 'unbanned' : 'banned'} successfully`);
            // Refresh the list to ensure sync with server
            this.loadUsers();
          },
          error: (error) => {
            console.error(`Error ${isBanned ? 'unbanning' : 'banning'} user:`, error);
            // Revert the optimistic update
            user.archived = isBanned;
            this.changeDetector.detectChanges();
          }
        });
      }
    });
  }

  trackById(index: number, user: UserResponse): number {
    return user.idUser;
  }
  
  getRole(user: User | UserResponse): string {
    if (!user.role) return 'N/A';
    
    if (typeof user.role === 'string') {
      return user.role;
    } else if (Array.isArray(user.role)) {
      return user.role.join(', ');
    } else if (typeof user.role === 'object') {
      return user.role.roleType || JSON.stringify(user.role);
    }
    
    return 'Unknown';
  }
  
  logToConsole(msg: string, data: any): void {
    console.log(msg, data);
  }
}