import { Component, OnInit } from '@angular/core';
import { ClubService } from '../services/club.service';
import { Club } from '../models/club.model';

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})
export class ClubsComponent implements OnInit {
  clubs: Club[] = [];
  filteredClubs: Club[] = [];
  searchText: string = '';
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private clubService: ClubService) {}

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs(): void {
    this.clubService.getAllClubs().subscribe({
      next: (data) => {
        this.clubs = data;
        this.filteredClubs = [...data];
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Erreur de chargement des clubs', err);
        this.errorMessage = 'Impossible de charger la liste des clubs. Veuillez réessayer plus tard.';
        this.filteredClubs = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchText) {
      this.filteredClubs = [...this.clubs];
      return;
    }

    const searchLower = this.searchText.trim().toLowerCase();
    this.filteredClubs = this.clubs.filter(club => {
      return club.name.toLowerCase().includes(searchLower) ||
             (club.description?.toLowerCase() || '').includes(searchLower);
    });
  }
}