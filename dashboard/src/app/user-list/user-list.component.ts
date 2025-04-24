import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserResponse } from '../models/user-response.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { Observable, finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: UserResponse[] = [];
  loading = true;
  apiStatus = 'Pending';

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
        next: (users) => {
          console.log('Users fetched successfully:', users);
          this.users = users;
          this.apiStatus = `Success: ${users.length} users loaded`;
          
          // Force the change detection
          setTimeout(() => {
            this.changeDetector.detectChanges();
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching users:', error);
          this.apiStatus = `Error: ${error.status} - ${error.message}`;
          
          // Check for specific error cases
          if (error.status === 401 || error.status === 403) {
            console.log('Authentication error. Redirecting to login...');
            this.router.navigate(['/login']);
          }
          
          this.changeDetector.detectChanges();
        }
      });
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
}