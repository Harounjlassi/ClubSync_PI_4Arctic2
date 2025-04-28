import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/services/user.service';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  isLoggedIn = false;
  userEmail: string = '';
  showDropdown = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    // Hide preloader
    setTimeout(() => {
      const preloader = document.getElementById('preloader-active');
      if (preloader) {
        preloader.style.display = 'none';
      }
    }, 1000);

    // Check if user is logged in
    this.checkLoginStatus();
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
      } else {
        // If user data is not available, fetch it from the API
        this.userService.getUserInfo().subscribe({
          next: (userResponse) => {
            this.userEmail = userResponse.email;
          },
          error: (err) => {
            console.error('Error fetching user info:', err);
          }
        });
      }
    }
  }

  navigateToLogin() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }
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
        this.storageService.clean(); // Make sure to clear storage
        this.isLoggedIn = false;
        this.userEmail = '';
        this.closeDropdown();
        this.router.navigate(['/front']);
      },
      error: (err) => {
        console.error('Error during logout:', err);
        // Even if there's an error, we clean up local state
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
    this.router.navigate(['/reclamationform']);
  }
}