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
        this.clubs = data;
        this.filteredClubs = data;
        this.isLoading = false;
        // Appliquer la recherche immédiatement après le chargement
        this.filterClubs(this.searchControl.value || '');
      },
      (error) => {
        console.error('Error fetching clubs:', error);
        this.error = true;
        this.isLoading = false;
      }
    );
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
}