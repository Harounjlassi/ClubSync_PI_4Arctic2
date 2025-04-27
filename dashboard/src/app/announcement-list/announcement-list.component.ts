import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Announcement } from '../models/announcement';
import { AnnouncementService } from '../services/announcement.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { AddAnnouncementDialogComponent } from '../add-announcement-dialog/add-announcement-dialog.component';
import { EditAnnouncementDialogComponent } from '../edit-announcement-dialog/edit-announcement-dialog.component';
import { AnnouncementDetailsDialogComponent } from '../announcement-details-dialog/announcement-details-dialog.component';
import { finalize, tap } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

// Define Club interface to fix TypeScript errors
interface Club {
  id_club: number;
  name: string;
}

// Extend jsPDF to include the lastAutoTable property
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  styleUrls: ['./announcement-list.component.css']
  
})
export class AnnouncementListComponent implements OnInit, AfterViewInit {
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  searchText: string = '';
  error: boolean = false;
  selectedClub: number | null = null;
  chart: any;
  currentView: string = 'table';  // Properly initialize with a value  
  // Club color mapping
  private clubColors = new Map<number, string>();
  clubs: { id: number; name: string }[] = [];

  
  // Modern color palette
  chartColors = {
    backgroundColors: [
      'rgba(59, 130, 246, 0.7)', // blue
      'rgba(16, 185, 129, 0.7)', // green
      'rgba(249, 115, 22, 0.7)', // orange
      'rgba(239, 68, 68, 0.7)',  // red
      'rgba(139, 92, 246, 0.7)', // purple
    ],
    borderColors: [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(249, 115, 22, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(139, 92, 246, 1)',
    ]
  };

  constructor(
    private announcementService: AnnouncementService,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    try {
      this.loadAnnouncements();
      document.querySelector('.fixed-plugin')?.remove();
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }
  
  
  ngAfterViewInit(): void {
    try {
      setTimeout(() => {
        if (this.announcements.length > 0) {
          this.generateChart();
        }
      }, 500);
    } catch (error) {
      console.error('Error in ngAfterViewInit:', error);
    }
  }

  // Method to get color for club cards
  getCardColor(clubId: number | undefined): string {
    if (!clubId) return '#607D8B'; // Default color for no club
    
    // If we haven't assigned a color to this club yet, do it now
    if (!this.clubColors.has(clubId)) {
      const colorIndex = this.clubColors.size % this.chartColors.borderColors.length;
      this.clubColors.set(clubId, this.chartColors.borderColors[colorIndex]);
    }
    
    return this.clubColors.get(clubId) || '#607D8B';
  }

  loadAnnouncements(): void {
    this.announcementService.getAll().subscribe({
      next: (data) => {
        // Vérifier et nettoyer les données reçues
        this.announcements = data.map(announcement => {
          // S'assurer que toutes les propriétés existent
          return {
            id: announcement.id || 0,
            title: announcement.title || '',
            content: announcement.content || '',
            clubId: announcement.clubId || null,
            club: announcement.club || null,
            createdAt: announcement.createdAt || new Date()
          };
        });
        
        this.buildClubList();
        this.applyFilter();
        this.cdRef.detectChanges(); // Forcer la détection des changements
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
        this.error = true;
      }
    });
  }

  private buildClubList() {
    const map = new Map<number, string>();
    for (const a of this.announcements) {
      if (a.clubId && a.club) {
        // Handle both cases: when club is an object or a number
        if (typeof a.club === 'object' && a.club !== null) {
          map.set(a.clubId, a.club.name);
        } else if (typeof a.clubId === 'number') {
          // If club is not an object, use clubId as identifier
          map.set(a.clubId, `Club #${a.clubId}`);
        }
      }
    }
    this.clubs = Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }
  
  // Method to assign colors to clubs consistently
  private assignColorsToClubs(): void {
    this.clubColors.clear();
    
    // Get unique club IDs
    const uniqueClubIds: number[] = [];
    
    this.announcements.forEach(a => {
      if (a.club) {
        let clubId: number | null = null;
        
        if (typeof a.club === 'object' && a.club !== null && 'id_club' in a.club) {
          clubId = a.club.id_club;
        } else if (typeof a.club === 'number') {
          clubId = a.club;
        } else if (a.clubId) {
          clubId = a.clubId;
        }
        
        if (clubId !== null && !uniqueClubIds.includes(clubId)) {
          uniqueClubIds.push(clubId);
        }
      }
    });
    
    // Assign colors to each club
    uniqueClubIds.forEach((clubId, index) => {
      const colorIndex = index % this.chartColors.borderColors.length;
      this.clubColors.set(clubId, this.chartColors.borderColors[colorIndex]);
    });
  }
  
  loadAnnouncementsByClub(clubId: number): void {
    if (!clubId) {
      this.loadAnnouncements();
      return;
    }

    this.announcementService.getByClub(clubId).subscribe({
      next: (data: Announcement[]) => {
        this.announcements = data;
        this.filteredAnnouncements = data;
        this.error = false;
        
        // Assign colors to clubs for cards
        this.assignColorsToClubs();

        setTimeout(() => {
          this.generateChart();
        }, 200);
      },
      error: (error) => {
        console.error(`Error fetching announcements for club ${clubId}:`, error);
        this.error = true;
      }
    });
  }
  
  getClubName(a: Announcement): string {
    if (!a.club) return 'No Club';
    
    if (typeof a.club === 'object' && a.club !== null && 'name' in a.club) {
      return a.club.name;
    } else if (typeof a.club === 'number') {
      // Trouver le nom du club dans la liste des clubs s'il existe
      const foundClub = this.clubs.find(c => c.id === a.club);
      return foundClub ? foundClub.name : `Club #${a.club}`;
    }
    
    return 'Unknown Club';
  }
  
  // Get club's ID safely, handling both object and number cases
  private getClubId(a: Announcement): number | null {
    if (!a.club) return null;
    
    if (typeof a.club === 'object' && a.club !== null && 'id_club' in a.club) {
      return a.club.id_club;
    } else if (typeof a.club === 'number') {
      return a.club;
    } else if (a.clubId) {
      return a.clubId;
    }
    
    return null;
  }

  generateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    // Group announcements by club
    const clubData = {};
    this.announcements.forEach(announcement => {
      // Get club name safely
      let clubName = 'Uncategorized';
      
      if (announcement.club) {
        if (typeof announcement.club === 'object' && announcement.club !== null && 'name' in announcement.club) {
          clubName = announcement.club.name;
        } else if (typeof announcement.club === 'number') {
          // Si c'est un ID numérique
          clubName = `Club #${announcement.club}`;
        }
      }
      
      clubData[clubName] = (clubData[clubName] || 0) + 1;
    });

    const labels = Object.keys(clubData);
    const data = Object.values(clubData);

    const ctx = document.getElementById('announcementChart') as HTMLCanvasElement;

    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Number of Announcements',
            data: data,
            backgroundColor: this.chartColors.backgroundColors,
            borderColor: this.chartColors.borderColors,
            borderWidth: 2,
            borderRadius: 4,
            hoverOffset: 10
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
              text: 'Distribution of Announcements by Club',
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
      console.error('Canvas element #announcementChart not found');
    }
  }

  toggleChartType(type: string): void {
    if (!this.chart) return;
    
    const currentData = this.chart.data;
    this.chart.destroy();
    
    const ctx = document.getElementById('announcementChart') as HTMLCanvasElement;
    
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
                text: 'Distribution of Announcements by Club',
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
        this.generateChart(); // Return to doughnut
      }
    }
  }

  openAddAnnouncementDialog(): void {
    const dialogRef = this.dialog.open(AddAnnouncementDialogComponent, {
      width: '500px',
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.id) {
        // Plutôt que d'ajouter manuellement, recharger les annonces
        this.loadAnnouncements();
        
        // Réappliquer le filtre
        this.applyFilter();
        
        // Forcer la détection des changements
        this.cdRef.detectChanges();
        
        this.toastr.success('Annonce ajoutée!', 'Succès', {positionClass: 'toast-bottom-right'});
      }
    });
  }
  
  // Méthode auxiliaire pour obtenir le nom du club par ID
  private getClubNameById(clubId: number): string {
    const club = this.clubs.find(c => c.id === clubId);
    return club ? club.name : `Club #${clubId}`;
  }

  deleteAnnouncement(id: number): void {
    if (!id) return;
  
    const dialogData: ConfirmDialogData = {
      title: 'Confirmation of Deletion',
      message: 'Are you sure you want to delete this announcement?'
    };
  
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData
    });
  
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.announcementService.deleteAnnouncement(id).subscribe({
          next: () => {
            this.loadAnnouncements();
            this.toastr.success('Announcement deleted successfully!', 'Success', {
              timeOut: 3000,
              progressBar: true
            });
          },
          error: (error) => {
            console.error('Error deleting announcement:', error);
            this.toastr.error('Failed to delete the announcement', 'Error', {
              timeOut: 3000,
              progressBar: true
            });
          }
        });
      }
    });
  }
  
  applyFilter(): void {
    this.filteredAnnouncements = this.announcements.filter(a => {
      const txt = this.searchText.toLowerCase();
      const title = (a.title ?? '').toLowerCase();
      const content = (a.content ?? '').toLowerCase();
      
      // Text filter
      const matchesSearch = !txt || title.includes(txt) || content.includes(txt);
      
      // Déterminer l'ID du club pour cette annonce
      let announcementClubId = null;
      
      if (a.clubId) {
        // Si clubId est défini, l'utiliser directement
        announcementClubId = a.clubId;
      } else if (a.club) {
        if (typeof a.club === 'object' && a.club !== null && 'id_club' in a.club) {
          // Si club est un objet avec id_club
          announcementClubId = a.club.id_club;
        } else if (typeof a.club === 'number') {
          // Si club est un ID numérique
          announcementClubId = a.club;
        }
      }
      
      // Log pour débogage
      console.log(`Annonce ${a.id}, Club: ${JSON.stringify(a.club)}, ClubId: ${announcementClubId}, Selected: ${this.selectedClub}`);
      
      // Club filter (si un club est sélectionné)
      const matchesClub = this.selectedClub
        ? announcementClubId === this.selectedClub
        : true;
      
      return matchesSearch && matchesClub;
    });
    
    // Régénérer le graphique
    setTimeout(() => this.generateChart(), 200);
  }
  
  exportToPDF(): void {
    // Create PDF document with landscape orientation
    const doc = new jsPDF('landscape');
    
    // Configure styles and colors
    const primaryColor = '#3f51b5'; // Primary color (indigo) for announcements
    const textColor = '#343a40';
    const titleFontSize = 20;
    const subtitleFontSize = 12;
    
    // Add styled header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 26, 'F');
    
    // Document title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('ANNOUNCEMENT MANAGEMENT SYSTEM', 14, 14);
    
    // Subtitle and export date
    doc.setFontSize(subtitleFontSize);
    doc.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Exported on: ${date}`, doc.internal.pageSize.width - 60, 14);
    
    // Filter information
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    let filterInfo = 'All Announcements';
    if (this.selectedClub) {
      // Find club name safely
      let clubName = 'Unknown Club';
      const foundAnnouncement = this.announcements.find(a => {
        if (a.club) {
          if (typeof a.club === 'object' && a.club !== null && 'id_club' in a.club) {
            return a.club.id_club === this.selectedClub;
          } else if (typeof a.club === 'number') {
            return a.club === this.selectedClub;
          } else if (a.clubId) {
            return a.clubId === this.selectedClub;
          }
        }
        return false;
      });
      
      if (foundAnnouncement) {
        clubName = this.getClubName(foundAnnouncement);
      }
      
      filterInfo = `Filtered by Club: ${clubName}`;
    }
    if (this.searchText) {
      filterInfo += ` | Search: "${this.searchText}"`;
    }
    doc.text(filterInfo, 14, 34);
    
    // Information about the number of announcements
    doc.setFontSize(11);
    doc.text(`Total Announcements: ${this.filteredAnnouncements.length}`, doc.internal.pageSize.width - 60, 34);
    
    // Prepare data for the table
    const tableData = this.filteredAnnouncements.map(announcement => [
      announcement.id,
      announcement.title,
      this.truncateText(announcement.content, 60),
      this.getClubName(announcement),
      this.formatDate(announcement.createdAt),
    ]);
    
    // Advanced table configuration
    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Title', 'Content', 'Club', 'Created Date']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [63, 81, 181], // Indigo primary
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
        1: { cellWidth: 40 }, // Title
        2: { cellWidth: 80 }, // Content
        3: { cellWidth: 40 }, // Club
        4: { cellWidth: 30 }, // Date
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawPage: (data) => {
        // Footer
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
          'Announcement Management System © 2025', 
          pageWidth - 80, 
          pageHeight - 10
        );
      }
    });
    
    // Save PDF file with descriptive name
    const fileName = this.selectedClub 
      ? `announcements_club_${this.selectedClub}.pdf` 
      : 'announcements_all.pdf';
    
    doc.save(fileName);
    
    // Success notification
    this.toastr.success('The PDF has been exported successfully!', 'Export Complete', {
      timeOut: 3000,
      progressBar: true
    });
  }
  
  // Utility method to truncate long text
  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Format date to readable string
  private formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  exportToExcel(): void {
    // Prepare data for Excel export
    const data = this.filteredAnnouncements.map(announcement => ({
      'ID': announcement.id,
      'Title': announcement.title,
      'Content': announcement.content,
      'Club': this.getClubName(announcement),
      'Created Date': this.formatDate(announcement.createdAt)
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 5 },  // ID
      { wch: 30 }, // Title
      { wch: 60 }, // Content
      { wch: 20 }, // Club
      { wch: 15 }, // Date
    ];
    worksheet['!cols'] = columnWidths;

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Announcements');

    // Generate the Excel file
    XLSX.writeFile(workbook, 'announcements_list.xlsx');
    
    // Success notification
    this.toastr.success('The Excel file has been exported successfully!', 'Export Complete', {
      timeOut: 3000,
      progressBar: true
    });
  }

  // Method for viewing full announcement details
  viewAnnouncementDetails(id: number): void {
    if (!id) return;
    
    // Find the announcement
    const announcement = this.announcements.find(a => a.id === id);
    if (!announcement) return;
    
    // Show detailed view in a dialog
    const dialogRef = this.dialog.open(AnnouncementDetailsDialogComponent, {
      width: '600px',
      data: { announcement }
    });
  }

  // The edit dialog implementation
  openEditAnnouncementDialog(announcement: Announcement): void {
    const dialogRef = this.dialog.open(EditAnnouncementDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { announcement: {...announcement} }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Ajout des logs de débogage
        console.log('Before update:', JSON.stringify(this.announcements));
        console.log('Dialog result:', JSON.stringify(result));
        
        // Opération de mise à jour
        this.loadAnnouncements();
        
        // Log après mise à jour
        setTimeout(() => {
          console.log('After update:', JSON.stringify(this.announcements));
        }, 300);
      }
    });
  }
}