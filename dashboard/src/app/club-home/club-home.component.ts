import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClubService } from '../services/club.service';
import { Club } from '../models/club.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from 'app/services/storage.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-club-home',
  templateUrl: './club-home.component.html',
  styleUrls: ['./club-home.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ClubHomeComponent implements OnInit {
  club: Club;
  clubId: number;
  isLoading = true;
  error = false;
  currentUserId: number;
  isMember = false;
  isCreator = false;
  activeTab = 'home';
  hasNewMembers = false;
  newMembersCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService,
    private snackBar: MatSnackBar,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clubId = +params['id'];
      if (this.clubId) {
        this.loadClubDetails();
        this.getCurrentUser();
        this.checkNewMembersStatus(); // Add this line
      } else {
        this.error = true;
        this.isLoading = false;
        this.showNotification('Invalid club ID', true);
      }
    });
  }

  loadClubDetails(): void {
    this.isLoading = true;
    this.error = false;

    this.clubService.getClubById(this.clubId).subscribe({
      next: (data) => {
        this.club = data;
        this.checkUserMembership();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading club details:', err);
        this.error = true;
        this.isLoading = false;
        this.showNotification('Failed to load club details', true);
      }
    });
  }

  getCurrentUser(): void {
    try {
      const token = this.storageService.getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.idUser;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  }

  checkUserMembership(): void {
    if (!this.club || !this.club.members || !this.currentUserId) return;

    this.isMember = this.club.members.some(member => member.idUser === this.currentUserId);
    this.isCreator = this.club?.creator?.idUser === this.currentUserId;
  }

  joinClub(): void {
    if (!this.currentUserId) {
      this.showNotification('You must be logged in to join a club', true);
      return;
    }

    this.clubService.addMemberToClub(this.clubId, this.currentUserId).subscribe({
      next: () => {
        this.loadClubDetails();
        this.showNotification('Successfully joined the club!');
      },
      error: (err) => {
        console.error('Error joining club:', err);
        this.showNotification('Failed to join the club. You might already be a member.', true);
      }
    });
  }

  leaveClub(): void {
    if (!this.currentUserId) {
      this.showNotification('You must be logged in to leave a club', true);
      return;
    }
  
    this.clubService.removeMemberFromClub(this.clubId, this.currentUserId).subscribe({
      next: () => {
        // Mettre à jour la liste des clubs avant la redirection
        this.clubService.notifyClubUpdate(); // Nouvelle méthode à ajouter au service
        
        this.showNotification('You have left the club');
        this.router.navigate(['/front/clubs']);
      },
      error: (err) => {
        console.error('Error leaving club:', err);
        this.showNotification('Failed to leave the club', true);
      }
    });
  }
  checkNewMembersStatus(): void {
    // This is a placeholder implementation - you would replace this
    // with actual logic to check for new members since last visit
    
    // For demonstration purposes:
    setTimeout(() => {
      if (this.club && this.club.members && this.club.members.length > 3) {
        this.hasNewMembers = true;
        this.newMembersCount = 2; // Example count
      }
    }, 1000);
  }

  showNotification(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: isError ? ['error-toast'] : ['success-toast']
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    // Reset notification when visiting the members tab
    if (tab === 'members') {
      this.hasNewMembers = false;
    }
    
    // For now, handle events and gallery tabs with placeholder content
    if ((tab === 'events' || tab === 'gallery') && !this.isMember) {
      this.showNotification('You must be a member to access this feature');
      this.activeTab = 'home';
    }
  }

  getCategoryColor(category: string): string {
    const colors = {
      'Sport': '#FF5252',
      'Art': '#536DFE',
      'Culture': '#FFC107',
      'Musique': '#9C27B0',
      'Technologie': '#00BCD4',
      'Science': '#4CAF50',
      'Littérature': '#8D6E63',
      'Autre': '#795548'
    };
    
    return colors[category] || '#9E9E9E';
  }

 
navigateBack(): void {
  this.router.navigate(['/front/clubs']);
}
  getMemberCountText(count: number): string {
    if (!count) return 'No members';
    return count === 1 ? '1 member' : `${count} members`;
  }
}