import { Component, OnInit } from '@angular/core';
import { ClubService } from '../services/club.service';
import { Club } from '../models/club.model';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { trigger, style, animate, transition } from '@angular/animations';
import { JokeService } from '../services/joke.service';


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

  constructor(
    private clubService: ClubService,
    private router: Router,
    private jokeService: JokeService
  ) {}

  ngOnInit(): void {
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
    event.stopPropagation(); // Empêche la navigation vers les détails du club
    
    // Liste des utilisateurs disponibles dans la base de données
    const availableUsers = [
      { id: 1, nom: 'Smith', prenom: 'Alice' },
      { id: 2, nom: 'Jones', prenom: 'Bob' },
      { id: 3, nom: 'Taylor', prenom: 'Carol' },
      { id: 4, nom: 'Brown', prenom: 'Dan' },
      { id: 5, nom: 'Wilson', prenom: 'Emma' },
      { id: 6, nom: 'Johnson', prenom: 'Frank' },
      { id: 7, nom: 'White', prenom: 'Grace' },
      { id: 8, nom: 'Martin', prenom: 'Henry' },
      { id: 9, nom: 'King', prenom: 'Isabel' },
      { id: 10, nom: 'Moore', prenom: 'Jack' },
      { id: 11, nom: 'Hall', prenom: 'Kate' },
      { id: 12, nom: 'Allen', prenom: 'Leo' },
      { id: 13, nom: 'Young', prenom: 'Mia' },
      { id: 14, nom: 'Scott', prenom: 'Nick' },
      { id: 15, nom: 'Green', prenom: 'Olivia' },
      { id: 16, nom: 'Adams', prenom: 'Peter' },
      { id: 17, nom: 'Nelson', prenom: 'Quinn' },
      { id: 18, nom: 'Baker', prenom: 'Rachel' },
      { id: 19, nom: 'Lopez', prenom: 'Steve' },
      { id: 20, nom: 'Gonzalez', prenom: 'Tina' }
    ];
    
    // Construire les options pour le menu déroulant
    const userOptions = availableUsers.map(user => `${user.id}: ${user.prenom} ${user.nom}`);
    
    // Afficher une boîte de dialogue avec les options
    const userChoice = prompt(
      'Choisissez un utilisateur pour rejoindre ce club:\n\n' + 
      userOptions.join('\n') + 
      '\n\nEntrez l\'ID de l\'utilisateur:'
    );
    
    if (userChoice && !isNaN(Number(userChoice))) {
      const userId = Number(userChoice);
      
      // Vérifier si l'ID entré correspond à un utilisateur disponible
      if (availableUsers.some(user => user.id === userId)) {
        this.clubService.addMemberToClub(clubId, userId).subscribe(
          response => {
            console.log('Club rejoint avec succès:', response);
            this.fetchClubs(); // Rafraîchir la liste des clubs pour mettre à jour le nombre de membres
            alert(`Club rejoint avec succès par l'utilisateur ${availableUsers.find(u => u.id === userId)?.prenom} ${availableUsers.find(u => u.id === userId)?.nom}!`);
          },
          error => {
            console.error('Erreur lors de la tentative de rejoindre le club:', error);
            alert('Erreur lors de la tentative de rejoindre le club');
          }
        );
      } else {
        alert('ID utilisateur invalide. Veuillez choisir un ID dans la liste.');
      }
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

  toggleJokePopup(): void {
    if (!this.isJokePopupVisible) {
      this.fetchJoke();
    }
    this.isJokePopupVisible = !this.isJokePopupVisible;
  }

  fetchJoke(): void {
    this.currentJoke = ''; // Réinitialiser pour afficher le loader
    
    setTimeout(() => {
      this.jokeService.getJoke().subscribe({
        next: (data) => this.currentJoke = data,
        error: (err) => {
          console.error('Erreur lors du chargement de la blague:', err);
          this.currentJoke = 'Impossible de charger une blague pour le moment.';
        }
      });
    }, 800); // Délai artificiel pour voir l'animation du loader
  }
}