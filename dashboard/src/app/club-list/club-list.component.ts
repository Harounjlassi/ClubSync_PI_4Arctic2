import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ClubService } from '../services/club.service';
import { Club } from '../models/club.model';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { EditClubDialogComponent } from '../edit-club-dialog/edit-club-dialog.component';
import { AddClubDialogComponent } from 'app/add-club-dialog/add-club-dialog.component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-club-list',
  templateUrl: './club-list.component.html',
  styleUrls: ['./club-list.component.css']
})
export class ClubListComponent implements OnInit, AfterViewInit {
  clubs: Club[] = [];
  filteredClubs: Club[] = [];
  searchText: string = '';
  error: boolean = false;
  selectedCategory: string = ''; // Stocke la catégorie sélectionnée
  chart: any;
  chartTopMembers: any; // une nouvelle instance pour le deuxième graphique


  categories: string[] = ['Sport', 'Art', 'Culture', 'Musique', 'Technologie', 'Science', 'Littérature', 'Autre'];

  constructor(
    private clubService: ClubService, 
    private dialog: MatDialog,   
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchClubs();
    document.querySelector('.fixed-plugin')?.remove();

  }

  ngAfterViewInit(): void {
    // Attendre que les données soient chargées et que le DOM soit prêt
    setTimeout(() => {
      if (this.clubs.length > 0) {
        this.generateChart();
      }
    }, 500);
  }

  fetchClubs(): void {
    this.clubService.getAllClubs().subscribe(
      (data: Club[]) => {
        this.clubs = data;
        // Au démarrage, la liste filtrée est identique à la liste complète
        this.filteredClubs = data;
        this.error = false;
        
        // Générer le graphique après que les données soient chargées
        setTimeout(() => {
          this.generateChart();
          this.generateTopMembersChart();
        }, 200);
              },
      (error) => {
        console.error('Error fetching clubs:', error);
        this.error = true;
      }
    );
  }
  generateTopMembersChart(): void {
    if (this.chartTopMembers) {
      this.chartTopMembers.destroy();
    }
  
    const topClubs = [...this.clubs]
      .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
      .slice(0, 5); // top 5 clubs
  
    const labels = topClubs.map(club => club.name);
    const data = topClubs.map(club => club.members?.length || 0);
  
    const ctx = document.getElementById('topMembersChart') as HTMLCanvasElement;
  
    if (ctx) {
      this.chartTopMembers = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nombre de Membres',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Top 5 Clubs par Nombre de Membres',
              font: {
                size: 16
              }
            },
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  generateChart(): void {
    console.log('Tentative de génération du graphique...');
    
    // Détruire le graphique existant s'il y en a un
    if (this.chart) {
      this.chart.destroy();
    }
    
    const categoryCounts = this.categories.map(category => 
      this.clubs.filter(c => c.categorie === category).length
    );

    console.log('Données du graphique - Catégories:', this.categories);
    console.log('Données du graphique - Comptages:', categoryCounts);

    const ctx = document.getElementById('clubChart') as HTMLCanvasElement;
    
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.categories,
          datasets: [{
            label: 'Nombre de Clubs',
            data: categoryCounts,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',  // Rouge
              'rgba(54, 162, 235, 0.6)',  // Bleu
              'rgba(255, 206, 86, 0.6)',  // Jaune
              'rgba(75, 192, 192, 0.6)',  // Vert
              'rgba(153, 102, 255, 0.6)', // Violet
              'rgba(255, 159, 64, 0.6)',  // Orange
              'rgba(199, 199, 199, 0.6)'  // Gris
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(199, 199, 199, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0 // Pour afficher uniquement des nombres entiers
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Distribution des clubs par catégorie',
              font: {
                size: 16
              }
            },
            legend: {
              display: true,
              position: 'top'
            }
          }
        }
      });
      
      console.log('Graphique généré avec succès');
    } else {
      console.error('Élément canvas #clubChart non trouvé dans le DOM');
    }
  }

  openAddClubDialog(): void {
    const dialogRef = this.dialog.open(AddClubDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchClubs();
      }
    });
  }

  deleteClub(id: number | undefined): void {
    if (!id) return;

    const dialogData: ConfirmDialogData = {
      title: 'Confirmation of Deletion',
      message: 'Are you sure you want to delete this club?'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.clubService.deleteClub(id).subscribe(
          () => {
            console.log('Club supprimé avec succès');
            this.fetchClubs();
          },
          (error) => {
            console.error('Erreur lors de la suppression du club:', error);
          }
        );
      }
    });
  }

  // Méthode pour filtrer la liste des clubs selon la recherche
  applyFilter(): void {
    this.filteredClubs = this.clubs.filter(club => {
      const matchesSearch = this.searchText
        ? club.name.toLowerCase().includes(this.searchText.toLowerCase())
        : true;
  
      const matchesCategory = this.selectedCategory
        ? club.categorie === this.selectedCategory
        : true;
  
      return matchesSearch && matchesCategory;
    });
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.text('Liste des Clubs', 14, 10);
  
    autoTable(doc, {
      startY: 20,
      head: [['ID', 'Nom', 'Description', 'Catégorie', 'Slogan', 'Créateur', 'Membres']],
      body: this.clubs.map(club => [
        club.id_club,
        club.name,
        club.description,
        club.categorie,
        club.slogan || 'Pas de slogan',
        club.creator?. email || 'N/A',
        club.members?.length || 0
      ]),
      theme: 'striped'
    });
  
    doc.save('liste_clubs.pdf');
  }
  
  openEditClubDialog(club: Club): void {
    const dialogRef = this.dialog.open(EditClubDialogComponent, {
      width: '400px',
      data: { club: club }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchClubs();
      }
    });
  }
  navigateToClubMembers(clubId: number): void {
    this.router.navigate(['/club-members', clubId]);
  }

 
}