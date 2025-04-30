import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReclamationService } from '../services/reclamation.service';
import { UserService } from '../services/user.service';
import { StorageService } from '../services/storage.service';
import { ReclamationResponse, ReclamationType } from '../models/reclamation.model';

@Component({
  selector: 'app-user-reclamations',
  templateUrl: './user-reclamation.component.html',
  styleUrls: ['./user-reclamation.component.css']
})
export class UserReclamationComponent implements OnInit {
  reclamations: ReclamationResponse[] = [];
  filteredReclamations: ReclamationResponse[] = [];
  loading = false;
  error = '';
  isLoggedIn = false;
  userEmail: string = '';
  userId: number | null = null;
  showDropdown = false;
  
  // Filter options
  filterStatus: string = 'ALL';
  filterType: string = 'ALL';
  searchTerm: string = '';
  
  constructor(
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
    
    // If logged in, fetch reclamations
    if (this.isLoggedIn) {
      this.loadReclamations();
    }
  }
  navigateToRec() {
    this.closeDropdown();
    this.router.navigate(['/reclamationf']); // Route for viewing user's reclamations
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
            this.loadReclamations();
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

  loadReclamations(): void {
    this.loading = true;
    this.reclamationService.getUserReclamations().subscribe({
      next: (data) => {
        this.reclamations = data;
        this.applyFilters(); // Initialize filtered reclamations
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reclamations. Please try again later.';
        console.error('Error loading reclamations:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    // Start with all reclamations
    let result = [...this.reclamations];
    
    // Apply status filter
    if (this.filterStatus !== 'ALL') {
      result = result.filter(r => r.statut === this.filterStatus);
    }
    
    // Apply type filter
    if (this.filterType !== 'ALL') {
      result = result.filter(r => r.typeReclamation === this.filterType);
    }
    
    // Apply search term
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      result = result.filter(r => 
        r.description.toLowerCase().includes(search)
      );
    }
    
    // Sort by date (newest first)
    result.sort((a, b) => 
      new Date(b.dateReclamation).getTime() - new Date(a.dateReclamation).getTime()
    );
    
    this.filteredReclamations = result;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.filterStatus = 'ALL';
    this.filterType = 'ALL';
    this.searchTerm = '';
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'RESOLVED': return 'text-success';
      case 'IN_PROGRESS': return 'text-warning';
      case 'REJECTED': return 'text-danger';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'RESOLVED': return 'fa-check-circle';
      case 'IN_PROGRESS': return 'fa-clock';
      case 'REJECTED': return 'fa-times-circle';
      default: return 'fa-question-circle';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  toggleDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
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

  createNewReclamation() {
    this.router.navigate(['/reclamationf']);
  }

  viewReclamationDetails(id: number) {
    this.router.navigate(['/user/reclamations', id]);
  }
}