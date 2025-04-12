import { Component, OnInit } from '@angular/core';
import { ClubService } from '../services/club.service';
import { Club } from '../models/club.model';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
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
  
  constructor(
    private clubService: ClubService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
  toggleDescription(club: Club): void {
    club.showFullDescription = !club.showFullDescription;  // Bascule la valeur
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
      { id: 3, nom: 'Doe', prenom: 'John' },
      { id: 8, nom: 'Doe', prenom: 'John' },
      { id: 9, nom: 'Johnson', prenom: 'Alice' },
      { id: 10, nom: 'Smith', prenom: 'Bob' },
      { id: 32, nom: 'System', prenom: 'Admin' },
      { id: 33, nom: 'Admin', prenom: 'Jane' },
      { id: 34, nom: 'Smith', prenom: 'Alice' },
      { id: 35, nom: 'Johnson', prenom: 'Bob' },
      { id: 36, nom: 'Wilson', prenom: 'Emma' },
      { id: 37, nom: 'Brown', prenom: 'Michael' },
      { id: 38, nom: 'Davis', prenom: 'Sarah' },
      { id: 39, nom: 'Miller', prenom: 'David' },
      { id: 40, nom: 'Wilson', prenom: 'Lisa' },
      { id: 41, nom: 'Moore', prenom: 'James' },
      { id: 42, nom: 'Taylor', prenom: 'Olivia' },
      { id: 43, nom: 'Anderson', prenom: 'William' },
      { id: 44, nom: 'Thomas', prenom: 'Ava' },
      { id: 45, nom: 'Jackson', prenom: 'Benjamin' },
      { id: 46, nom: 'White', prenom: 'Mia' },
      { id: 47, nom: 'Harris', prenom: 'Ethan' },
      { id: 48, nom: 'Martin', prenom: 'Sophia' },
      { id: 49, nom: 'Clark', prenom: 'Alexander' },
      { id: 50, nom: 'Rodriguez', prenom: 'Charlotte' },
      { id: 51, nom: 'Mejri', prenom: 'Wassim' }
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
}