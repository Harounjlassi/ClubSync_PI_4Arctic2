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

// Extend jsPDF to include the lastAutoTable property
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

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
  selectedCategory: string = '';
  chart: any;
  chartTopMembers: any;

  categories: string[] = ['Sport', 'Art', 'Culture', 'Musique', 'Technologie', 'Science', 'Littérature', 'Autre'];
  // Palette de couleurs moderne
  chartColors = {
    backgroundColors: [
      'rgba(59, 130, 246, 0.7)', // bleu
      'rgba(16, 185, 129, 0.7)', // vert
      'rgba(249, 115, 22, 0.7)', // orange
      'rgba(239, 68, 68, 0.7)',  // rouge
      'rgba(139, 92, 246, 0.7)', // violet
      'rgba(236, 72, 153, 0.7)', // rose
      'rgba(20, 184, 166, 0.7)', // turquoise
      'rgba(234, 179, 8, 0.7)'   // jaune
    ],
    borderColors: [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(249, 115, 22, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(20, 184, 166, 1)',
      'rgba(234, 179, 8, 1)'
    ]
  };
loading: any;


  constructor(
    private clubService: ClubService, 
    private dialog: MatDialog,   
    private router: Router,
    private toastr: ToastrService // <-- Ajout

  ) {}

  ngOnInit(): void {
    this.fetchClubs();
    document.querySelector('.fixed-plugin')?.remove();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.clubs.length > 0) {
        this.generateChart();
      }
    }, 500);
  }
  private destroy$ = new Subject<void>();

  fetchClubs(): void {
    this.clubService.getAllClubs().pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (data: Club[]) => {
        this.clubs = data;
        this.filteredClubs = data;
        this.error = false;

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
// In both components

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
  
  // Clean up charts
  if (this.chart) {
    this.chart.destroy();
  }
  if (this.chartTopMembers) {
    this.chartTopMembers.destroy();
  }
}
  generateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const categoryCounts = this.categories.map(category => 
      this.clubs.filter(c => c.categorie === category).length
    );

    const ctx = document.getElementById('clubChart') as HTMLCanvasElement;

    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'doughnut', // Changé pour un diagramme en anneau plus moderne
        data: {
          labels: this.categories,
          datasets: [{
            label: 'Nombre de Clubs',
            data: categoryCounts,
            backgroundColor: this.chartColors.backgroundColors,
            borderColor: this.chartColors.borderColors,
            borderWidth: 2,
            borderRadius: 4, // Coins arrondis pour un look moderne
            hoverOffset: 10 // Effet d'expansion au survol
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: 20
          },
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 15,
                padding: 15,
                font: {
                  size: 13,
                  family: "'Roboto', sans-serif",
                  weight: 500
                }
              }
            },
            title: {
              display: true,
              text: 'Distribution of Clubs by Category',
              font: {
                size: 18,
                family: "'Roboto', sans-serif",
                weight: 600
              },
              padding: {
                top: 10,
                bottom: 20
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleFont: {
                size: 14,
                family: "'Roboto', sans-serif",
                weight: 600
              },
              bodyFont: {
                size: 13,
                family: "'Roboto', sans-serif"
              },
              padding: 12,
              cornerRadius: 6,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const percentage = Math.round((value / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      });
    } else {
      console.error('Élément canvas #clubChart non trouvé ');
    }
  }

  // Fonction pour basculer entre différents types de graphiques
  toggleChartType(type: string): void {
    if (!this.chart) return;
    
    const currentData = this.chart.data;
    this.chart.destroy();
    
    const ctx = document.getElementById('clubChart') as HTMLCanvasElement;
    
    if (ctx) {
      if (type === 'bar') {
        this.chart = new Chart(ctx, {
          type: 'bar',
          data: currentData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              title: {
                display: true,
                text: 'Distribution of Clubs by Category',
                font: {
                  size: 18,
                  family: "'Roboto', sans-serif",
                  weight: 600
                },
                padding: {
                  top: 10,
                  bottom: 20
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                  size: 14,
                  family: "'Roboto', sans-serif"
                },
                bodyFont: {
                  size: 13,
                  family: "'Roboto', sans-serif"
                },
                padding: 12,
                cornerRadius: 6
              }
            },
            animation: {
              duration: 1000
            }
          }
        });
      } else {
        this.generateChart(); // Retour au doughnut
      }
    }
  }

  generateTopMembersChart(): void {
    if (this.chartTopMembers) {
      this.chartTopMembers.destroy();
    }

    const topClubs = [...this.clubs]
      .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
      .slice(0, 5);

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
            backgroundColor: this.chartColors.backgroundColors[0],
            borderColor: this.chartColors.borderColors[0],
            borderWidth: 2,
            borderRadius: 8, // Coins arrondis pour un look moderne
            borderSkipped: false, // Pour que le border-radius s'applique à tous les coins
            barThickness: 'flex',
            maxBarThickness: 50
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y', // Bar horizontale pour une meilleure lisibilité
          scales: {
            x: {
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                font: {
                  family: "'Roboto', sans-serif",
                  size: 12
                }
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: "'Roboto', sans-serif",
                  size: 12,
                  weight: 500
                }
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Top 5 Clubs by Number of Members',
              font: {
                size: 18,
                family: "'Roboto', sans-serif",
                weight: 600
              },
              padding: {
                top: 10,
                bottom: 20
              }
            },
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleFont: {
                family: "'Roboto', sans-serif",
                size: 14
              },
              bodyFont: {
                family: "'Roboto', sans-serif",
                size: 13
              },
              padding: 12,
              cornerRadius: 6,
              displayColors: false
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      });
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
        this.clubService.deleteClub(id).subscribe({
          next: () => {
            this.fetchClubs();
            this.toastr.success('Club deleted successfully!', 'Success', {
              timeOut: 3000,
              progressBar: true
            });
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du club:', error);
            this.toastr.error('Failed to delete the club', 'Error', {
              timeOut: 3000,
              progressBar: true
            });
          }
        });
      }
    });
  }
  

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
    // Création du document PDF avec orientation paysage pour mieux présenter les données
    const doc = new jsPDF('landscape');
    
    // Configuration des styles et couleurs
    const primaryColor = '#d32f2f'; // Couleur primaire (danger) de votre thème
    const textColor = '#343a40';
    const titleFontSize = 20;
    const subtitleFontSize = 12;
    
    // Ajout d'un en-tête stylisé
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 26, 'F');
    
    // Titre du document
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('CLUB MANAGEMENT SYSTEM', 14, 14);
    
    // Sous-titre et date d'exportation
    doc.setFontSize(subtitleFontSize);
    doc.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Exported on: ${date}`, doc.internal.pageSize.width - 60, 14);
    
    // Information sur le filtre appliqué
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    let filterInfo = 'All Clubs';
    if (this.selectedCategory) {
      filterInfo = `Filtered by Category: ${this.selectedCategory}`;
    }
    if (this.searchText) {
      filterInfo += ` | Search: "${this.searchText}"`;
    }
    doc.text(filterInfo, 14, 34);
    
    // Information sur le nombre de clubs
    doc.setFontSize(11);
    doc.text(`Total Clubs: ${this.filteredClubs.length}`, doc.internal.pageSize.width - 60, 34);
    
    // Préparation des données pour le tableau
    // Utilisons les clubs filtrés plutôt que tous les clubs
    const tableData = this.filteredClubs.map(club => [
      club.id_club,
      club.name,
      this.truncateText(club.description, 60),
      club.categorie || 'Uncategorized',
      this.truncateText(club.slogan || 'No Slogan', 30),
      club.creator?.firstname || 'N/A',
      club.members?.length || 0
    ]);
    
    // Configuration avancée du tableau
    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Club Name', 'Description', 'Category', 'Slogan', 'Creator', 'Members']],
      body: tableData,
      theme: 'grid', // Plus détaillé que 'striped'
      headStyles: {
        fillColor: [211, 47, 47], // Rouge primaire
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [220, 220, 220]
      },
      columnStyles: {
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 40 }, // Name
        2: { cellWidth: 60 }, // Description
        3: { cellWidth: 30 }, // Category
        4: { cellWidth: 40 }, // Slogan
        5: { cellWidth: 30 }, // Creator
        6: { cellWidth: 20, halign: 'center' } // Members
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawPage: (data) => {
        // Pied de page
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`, 
          data.settings.margin.left, 
          pageHeight - 10
        );
        
        const pageWidth = doc.internal.pageSize.width;
        doc.text(
          'Club Management System © 2025', 
          pageWidth - 60, 
          pageHeight - 10
        );
      }
    });
    
    // Ajout d'un résumé statistique à la fin du document (après le tableau)
    if (doc.lastAutoTable) {
      const finalY = doc.lastAutoTable.finalY + 20;
      
      // Titre de la section statistique
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Statistics Summary', 14, finalY);
      
      // Préparation des données statistiques par catégorie
      const categoryCounts = {};
      this.filteredClubs.forEach(club => {
        const category = club.categorie || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Affichage des statistiques par catégorie
      doc.setFontSize(10);
      doc.setTextColor(textColor);
      doc.setFont('helvetica', 'normal');
      
      let yPosition = finalY + 10;
      doc.text('Distribution by Category:', 14, yPosition);
      yPosition += 6;
      
      Object.entries(categoryCounts).forEach(([category, count], index) => {
        const percentage = Math.round((count as number / this.filteredClubs.length) * 100);
        doc.text(`${category}: ${count} clubs (${percentage}%)`, 20, yPosition);
        yPosition += 5;
      });
    }
    
    // Sauvegarde du fichier PDF avec un nom explicite
    const fileName = this.selectedCategory 
      ? `club_list_${this.selectedCategory.toLowerCase()}.pdf` 
      : 'club_list_complete.pdf';
    
    doc.save(fileName);
    
    // Notification de succès
    this.toastr.success('The PDF has been exported successfully!', 'Export Complete', {
      timeOut: 3000,
      progressBar: true
    });
  }
  
  // Méthode utilitaire pour tronquer les textes longs
  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  exportToExcel(): void {
    // Prepare data for Excel export
    const data = this.clubs.map(club => ({
      'ID': club.id_club,
      'Name': club.name,
      'Description': club.description,
      'Category': club.categorie || 'Uncategorized',
      'Slogan': club.slogan || 'No Slogan',
      'Creator': club.creator?.firstname || 'N/A',
      'Members Count': club.members?.length || 0
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 5 },  // ID
      { wch: 20 }, // Name
      { wch: 40 }, // Description
      { wch: 15 }, // Category
      { wch: 25 }, // Slogan
      { wch: 20 }, // Creator
      { wch: 15 }  // Members Count
    ];
    worksheet['!cols'] = columnWidths;

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clubs');

    // Generate the Excel file
    XLSX.writeFile(workbook, 'liste_clubs.xlsx');
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
