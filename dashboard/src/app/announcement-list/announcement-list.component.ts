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
    private toastr: ToastrService
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

  loadAnnouncements(): void {
    this.announcementService.getAll().subscribe(
      (data: Announcement[]) => {
        this.announcements = data;
        this.filteredAnnouncements = data;
        this.error = false;

        setTimeout(() => {
          this.generateChart();
        }, 200);
      },
      (error) => {
        console.error('Error fetching announcements:', error);
        this.error = true;
      }
    );
  }

  loadAnnouncementsByClub(clubId: number): void {
    if (!clubId) {
      this.loadAnnouncements();
      return;
    }

    this.announcementService.getByClub(clubId).subscribe(
      (data: Announcement[]) => {
        this.announcements = data;
        this.filteredAnnouncements = data;
        this.error = false;

        setTimeout(() => {
          this.generateChart();
        }, 200);
      },
      (error) => {
        console.error(`Error fetching announcements for club ${clubId}:`, error);
        this.error = true;
      }
    );
  }

  generateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    // Group announcements by club
    const clubData = {};
    this.announcements.forEach(announcement => {
      const clubName = announcement.club?.name || 'Uncategorized';
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
      if (result) {
        this.loadAnnouncements();
      }
    });
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
    this.filteredAnnouncements = this.announcements.filter(announcement => {
      const matchesSearch = this.searchText
        ? announcement.title.toLowerCase().includes(this.searchText.toLowerCase()) || 
          announcement.content.toLowerCase().includes(this.searchText.toLowerCase())
        : true;

      const matchesClub = this.selectedClub
        ? announcement.club?.id_club === this.selectedClub
        : true;

      return matchesSearch && matchesClub;
    });
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
      const clubName = this.announcements.find(a => a.club?.id_club === this.selectedClub)?.club?.name || 'Unknown Club';
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
      announcement.club?.name || 'N/A',
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
      'Club': announcement.club?.name || 'N/A',
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

  // The edit dialog implementation would depend on your specific dialog component
  openEditAnnouncementDialog(announcement: Announcement): void {
    const dialogRef = this.dialog.open(EditAnnouncementDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { announcement }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadAnnouncements();
        // Update chart if necessary
        setTimeout(() => {
          this.generateChart();
        }, 200);
      }
    });
  }
  viewAnnouncementDetails(announcementId: number): void {
    this.router.navigate(['/announcement-details', announcementId]);
  }
}