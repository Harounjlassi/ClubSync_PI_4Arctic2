import { Component, HostListener, OnInit } from '@angular/core';
import { ClubService } from '../services/club.service';
import { Club } from '../models/club.model';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { trigger, style, animate, transition } from '@angular/animations';
import { JokeService } from '../services/joke.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from 'app/services/storage.service';
import { RecommendationService } from 'app/services/recommendation.service';
import { UserService } from 'app/services/user.service';

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ]
})

export class ClubsComponent implements OnInit {
  clubs: Club[] = [];
  filteredClubs: Club[] = [];
  categories: string[] = ['Sport', 'Art', 'Culture', 'Musique', 'Technologie', 'Science', 'Littérature', 'Autre'];
  
  selectedCategory: string = '';
  searchControl = new FormControl('');
  isLoading = true;
  error = false;
  viewMode: 'grid' | 'list' = 'grid';
  isChatVisible = false;
  isJokePopupVisible = false;
  currentJoke: string = '';
  isSharingExpanded: boolean = false;
  selectedLanguage: string = 'fr'; // Default language
  recommendedClubs: Club[] = [];
  showRecommendations: boolean = false;
  userClubs: Club[] = [];
  isMyClubsDropdownOpen = false;
  isLoadingClubs = false;
  errorLoadingClubs = false;

  isLoggedIn = false;
  userEmail: string = '';
  showDropdown = false;

  


  constructor(
    private clubService: ClubService,
    private router: Router,
    private jokeService: JokeService, 
    private snackBar: MatSnackBar,
    private storageService: StorageService ,// Ajoutez cette ligne
    private recommendationService: RecommendationService ,// Ajoutez cette ligne
    private userService: UserService,
    


  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    // Ajouter cette subscription
  this.clubService.clubUpdates$.subscribe(() => {
    this.loadUserClubs();
  });
    setTimeout(() => {
      const preloader = document.getElementById('preloader-active');
      if (preloader) {
        preloader.style.display = 'none';
      }
      
    }, 1000); // Small timeout to ensure content has loaded
  
    this.fetchClubs();
    
    // Setup search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.filterClubs(value || '');
      });
      this.loadRecommendations();

  }
  loadRecommendations(): void {
    const token = this.storageService.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.idUser;

      if (!userId) {
        this.showRecommendations = false;
        return;
      }

      this.recommendationService.getRecommendedClubs(userId).subscribe({
        next: (recommendations) => {
          this.recommendedClubs = recommendations;
          this.showRecommendations = this.recommendedClubs.length > 0;
        },
        error: (error) => {
          console.error('Erreur des recommandations:', error);
          this.recommendedClubs = [];
          this.showRecommendations = false;
        }
      });
    } catch (error) {
      console.error('Erreur token:', error);
      this.showRecommendations = false;
    }
  }

  
  fetchClubs(): void {
    this.isLoading = true;
    this.clubService.getAllClubs().subscribe(
      (data: Club[]) => {
        // Initialise showFullDescription à false pour chaque club
        this.clubs = data.map(club => ({ ...club, showFullDescription: false }));
        this.filteredClubs = this.clubs;
        this.isLoading = false;
        // Appliquer immédiatement le filtre de recherche
        this.filterClubs(this.searchControl.value || '');
      },
      (error) => {
        console.error('Error fetching clubs:', error);
        this.error = true;
        this.isLoading = false;
      }
    );
  }

  toggleDescription(event: Event, club: Club): void {
    event.stopPropagation(); // Bloque la propagation du clic
    event.preventDefault(); // Optionnel - empêche les comportements par défaut
    club.showFullDescription = !club.showFullDescription;
  }
    
  filterClubs(searchText: string): void {
    this.filteredClubs = this.clubs.filter(club => {
      const matchesSearch = searchText
        ? club.name.toLowerCase().includes(searchText.toLowerCase())
        : true;
      
      const matchesCategory = this.selectedCategory
        ? club.categorie === this.selectedCategory
        : true;
      
      return matchesSearch && matchesCategory;
    });
  }
  
  onCategoryChange(): void {
    this.filterClubs(this.searchControl.value || '');
  }
  
  clearFilters(): void {
    this.selectedCategory = '';
    this.searchControl.setValue('');
    this.filteredClubs = this.clubs;
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
  
  navigateToClubDetails(clubId: number): void {
    this.router.navigate(['/club-details', clubId]);
  }
  
  toggleView(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }
  
  getMemberCountText(count: number): string {
    if (!count) return 'Aucun membre';
    return count === 1 ? '1 membre' : `${count} membres`;
  }

  joinClub(event: Event, clubId: number): void {
    event.stopPropagation();
    
    // Obtenir le token et extraire l'ID utilisateur
    const token = this.storageService.getToken();
    
    if (!token) {
      this.snackBar.open('Vous devez être connecté pour rejoindre un club', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-toast']
      });
      return;
    }
    
    // Extraire l'ID utilisateur du token JWT
    // Le token est divisé en 3 parties séparées par des points
    // La deuxième partie contient les informations du payload
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.idUser;
      
      if (!userId) {
        this.snackBar.open('Impossible de déterminer votre identifiant utilisateur', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-toast']
        });
        return;
      }
      
      // Continuer avec l'ID utilisateur
      this.clubService.addMemberToClub(clubId, userId).subscribe(
        response => {
          console.log('Club rejoint avec succès:', response);
          this.fetchClubs();
          this.snackBar.open(`Successfuly joined!`, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-toast']
          });
        },
        error => {
          console.error('Erreur lors de la tentative de rejoindre le club:', error);
          this.snackBar.open('You are already member of this club', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-toast']
          });
        }
      );
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      this.snackBar.open('Erreur lors de l\'identification de l\'utilisateur', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-toast']
      });
    }
  }

  toggleChatPopup(): void {
    this.isChatVisible = !this.isChatVisible;
  }

  // Calcule le nombre total de membres dans tous les clubs
  getTotalMembers(): number {
    return this.clubs.reduce((total, club) => total + (club.members?.length || 0), 0);
  }

  // Trouve le club le plus populaire (avec le plus de membres)
  getMostPopularClub(): Club | null {
    if (this.clubs.length === 0) return null;
    
    return this.clubs.reduce((mostPopular, current) => {
      const currentMembers = current.members?.length || 0;
      const popularMembers = mostPopular.members?.length || 0;
      
      return currentMembers > popularMembers ? current : mostPopular;
    }, this.clubs[0]);
  }

  // Compte le nombre de clubs par catégorie
  getClubCountByCategory(category: string): number {
    return this.clubs.filter(club => club.categorie === category).length;
  }

  // Calcule le pourcentage de clubs par catégorie
  getPercentageByCategory(category: string): number {
    if (this.clubs.length === 0) return 0;
    
    const count = this.getClubCountByCategory(category);
    return (count / this.clubs.length) * 100;
  }

  // Methods for joke popup and sharing
  toggleJokePopup(): void {
    if (!this.isJokePopupVisible) {
      this.fetchJoke();
    }
    this.isJokePopupVisible = !this.isJokePopupVisible;
    // Reset sharing panel when closing
    if (!this.isJokePopupVisible) {
      this.isSharingExpanded = false;
    }
  }

  fetchJoke(): void {
    this.currentJoke = ''; // Réinitialiser pour afficher le loader
    this.isSharingExpanded = false; // Reset sharing panel when fetching new joke
    
    setTimeout(() => {
      this.jokeService.getJoke(this.selectedLanguage).subscribe({
        next: (data) => {
          console.log('Joke received:', data);
          this.currentJoke = data;
        },
        error: (err) => {
          console.error('Erreur détaillée lors du chargement de la blague:', err);
          this.currentJoke = 'Impossible de charger une blague pour le moment.';
        }
      });
    }, 800);
  }

  // Toggle sharing options panel
  toggleShareOptions(): void {
    this.isSharingExpanded = !this.isSharingExpanded;
  }

  // Handle sharing on different platforms
  shareJokeOn(platform: string): void {
    if (!this.currentJoke) return;

    switch (platform) {
      case 'facebook':
        this.jokeService.shareOnFacebook(this.currentJoke);
        break;
      case 'twitter':
        this.jokeService.shareOnTwitter(this.currentJoke);
        break;
      case 'linkedin':
        this.jokeService.shareOnLinkedIn(this.currentJoke);
        break;
      case 'whatsapp':
        this.jokeService.shareOnWhatsApp(this.currentJoke);
        break;
      case 'email':
        this.jokeService.shareByEmail(this.currentJoke);
        break;
      case 'copy':
        this.jokeService.copyToClipboard(this.currentJoke)
          .then(success => {
            if (success) {
              this.showNotification('Blague copiée dans le presse-papier !');
            } else {
              this.showNotification('Impossible de copier la blague', true);
            }
          });
        break;
    }
  }

  // Show notification using MatSnackBar
  showNotification(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: isError ? ['error-toast'] : ['success-toast']
    });
  }

  // Change joke language
  changeJokeLanguage(language: string): void {
    this.selectedLanguage = language;
    this.fetchJoke();
  }

  // Rafraîchir les recommandations
refreshRecommendations(): void {
  this.loadRecommendations();
  this.snackBar.open('Recommandations mises à jour', 'Fermer', {
    duration: 2000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom'
  });
}

// Ignorer une recommandation (masquer de l'UI)
ignoreRecommendation(event: Event, clubId: number): void {
  event.stopPropagation();
  this.recommendedClubs = this.recommendedClubs.filter(club => club.id_club !== clubId);
  
  if (this.recommendedClubs.length === 0) {
    this.showRecommendations = false;
  }
  
  this.snackBar.open('Recommandation ignorée', 'Annuler', {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom'
  }).onAction().subscribe(() => {
    // Si l'utilisateur clique sur Annuler, on recharge les recommandations
    this.loadRecommendations();
  });
}

// Méthode pour obtenir l'ID utilisateur
private getCurrentUserId(): number {
  const token = this.storageService.getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.idUser;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw new Error('Invalid token format');
  }
}

// Méthode améliorée pour charger les clubs
loadUserClubs(): void {
  this.isLoadingClubs = true;
  this.errorLoadingClubs = false;
  this.userClubs = []; // Reset la liste avant le rechargement

  try {
    const userId = this.getCurrentUserId();
    
    this.clubService.getClubsByUser(userId).subscribe({
      next: (clubs) => {
        this.userClubs = clubs;
        this.isLoadingClubs = false;
      },
      error: (error) => {
        console.error('Error loading clubs:', error);
        this.isLoadingClubs = false;
        this.errorLoadingClubs = true;
      }
    });
  } catch (error) {
    this.isLoadingClubs = false;
    this.errorLoadingClubs = true;
  }
}

// Méthode améliorée pour basculer le dropdown
toggleMyClubsDropdown(event: Event): void {
  event.stopPropagation();
  
  this.isMyClubsDropdownOpen = !this.isMyClubsDropdownOpen;
  
  if (this.isMyClubsDropdownOpen) {
    if (this.userClubs.length === 0) {
      this.loadUserClubs();
    }
    // Ajouter un écouteur manuel pour la fermeture au scroll
    window.addEventListener('scroll', this.closeOnScroll.bind(this), true);
  } else {
    window.removeEventListener('scroll', this.closeOnScroll.bind(this), true);
  }
}

// Méthode pour fermer au scroll
private closeOnScroll(): void {
  if (this.isMyClubsDropdownOpen) {
    this.closeMyClubsDropdown();
  }
}

// Méthode pour fermer le dropdown
closeMyClubsDropdown(): void {
  this.isMyClubsDropdownOpen = false;
  window.removeEventListener('scroll', this.closeOnScroll.bind(this), true);
}
// Add this method to your ClubsComponent class
navigateToUserClub(clubId: number): void {
  this.closeMyClubsDropdown();
  this.router.navigate(['/front/club-home', clubId]); // Ajouter le segment 'front'
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
    this.router.navigate(['/reclamationf']);
  }
}
