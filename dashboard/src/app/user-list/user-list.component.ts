import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserResponse } from '../models/user-response.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';

// Add the MatDialog to your constructor


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: UserResponse[] = [];
  loading = true;

  constructor(
    private userService: UserService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private dialog: MatDialog  // Inject MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    document.querySelector('.fixed-plugin')?.remove();
  }

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  onEdit(userId: number): void {
    this.router.navigate(['/users/edit', userId]);
  }

  onDelete(idUser: number): void {
    if (!idUser) return;
  
    // Create dialog data for confirmation
    const dialogData = {
      title: 'Confirmation of Deletion',
      message: 'Are you sure you want to delete this user?'
    };
  
    // Open confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData
    });
  
    // Handle the result after dialog is closed
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.userService.deleteUser(idUser).subscribe(
          () => {
            console.log('User supprimé avec succès');
            this.loadUsers();
          },
          (error) => {
            console.error('Erreur lors de la suppression du User:', error);
          }
        );
      }
    });
  }

  // Fonction trackBy pour optimiser le rendu
  trackById(index: number, user: UserResponse): number {
    return user.idUser;
  }
}