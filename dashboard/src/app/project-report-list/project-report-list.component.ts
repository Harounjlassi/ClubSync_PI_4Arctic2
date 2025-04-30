import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from 'app/services/report.service';
import { Report } from 'app/common/report';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProjetTask } from 'app/common/projet-task';
import { TaskService } from 'app/services/task.service';

@Component({
  selector: 'app-project-report-list',
  templateUrl: './project-report-list.component.html',
  styleUrls: ['./project-report-list.component.scss']
})
export class ProjectReportListComponent implements OnInit {
searchQuery: any;
filterReports() {
throw new Error('Method not implemented.');
}
  activeTab: string = 'performance';
  reports: Report[] = [];
  selectedReport: Report | null = null;
  showModal = false;
  editingReport = false;
  reportForm: FormGroup;
  isSaving = false;
  tasks :ProjetTask[]= [];



  constructor(
    private reportService: ReportService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private taskService: TaskService

  ) {
    this.reportForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['Pending', Validators.required],
      TacheTitre: [''],
      ReporterFirstName: ['']
    });
  }

  ngOnInit() {
    this.loadReports();
    this.loadTasks();

  }
  loadTasks(): void {
    const projectId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Project ID:', projectId); // Debug log
  
    this.taskService.getTasksByIdProjet(projectId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        console.log('Fetched tasks:', tasks); // Debug log
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        // Optional: show error message to user
      }
    });
  }

  loadReports(): void {
    const projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.reportService.getReportsByProjectId(projectId).subscribe({
      next: (reports) => this.reports = reports,
      error: (error) => console.error('Error loading reports:', error)
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Implement filtering logic if needed
  }

  openReportModal(report?: Report): void {
    this.showModal = true;
    this.editingReport = !!report;
    
    if (report) {
      this.selectedReport = report;
      this.reportForm.patchValue({
        title: report.title,
        description: report.description,
        status: report.status,
        TacheTitre: report.TacheTitre,
        ReporterFirstName: report.ReporterFirstName
      });
    } else {
      this.selectedReport = new Report(
        0, '', '', 'Pending', new Date(), new Date(), 0, '', ''
      );
      this.reportForm.reset({
        status: 'Pending'
      });
    }
  }

  editReport(report: Report): void {
    this.openReportModal(report);

  }

  submitReport(): void {
    console.log('Form valsssssssssues:', this.reportForm.value);
    console.log('Selected report:', this.selectedReport);
    if (this.reportForm.valid && this.selectedReport && !this.isSaving) {
      this.isSaving = true;
      const updatedReport = {
        ...this.reportForm.value,
        lastUpdated: new Date(),
        ProjetId:Number(this.route.snapshot.paramMap.get('id')),
        id: this.selectedReport.id
      };

      const operation = this.editingReport 
        ? this.reportService.updateReport(updatedReport)
        : this.reportService.createReport(updatedReport);

      operation.subscribe({
        next: () => {
          this.isSaving = false;
          this.loadReports();
          this.closeModal();
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error saving report:', error);
        }
      });
    }
  }

  deleteReport(report: Report): void {
    if (confirm(`Are you sure you want to delete "${report.title}"?`)) {
      this.reportService.deleteReport(report.id).subscribe({
        next: () => this.loadReports(),
        error: (error) => console.error('Error deleting report:', error)
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.reportForm.reset();
  }

  // Selection methods
  allSelected(): boolean {
    return this.reports.length > 0 && this.reports.every(r => r.selected);
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.reports.forEach(report => report.selected = isChecked);
  }

  hasSelectedReports(): boolean {
    return this.reports.some(r => r.selected);
  }

  // Bulk operations
  deleteSelected(): void {
    const selectedReports = this.reports.filter(r => r.selected);
    
    if (selectedReports.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedReports.length} selected report(s)?`)) {
      // Corrected forkJoin implementation
      forkJoin(
        selectedReports.map(report => 
          this.reportService.deleteReport(report.id)
        )
      ).subscribe({
        next: () => this.loadReports(),
        error: (error) => console.error('Error deleting reports:', error)
      });
    }
  }

  exportSelected(): void {
    const selectedReports = this.reports.filter(r => r.selected);
    if (selectedReports.length === 0) return;
    
    // Implement your export logic here
    console.log('Exporting reports:', selectedReports);
    // Example: this.exportService.exportReports(selectedReports);
  }

  // Status badge class helper
  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
  getReportIcon(type: string): string {
    const icons: {[key: string]: string} = {
      'processing': 'show_chart',
      'pending': 'receipt',
      'COMPLETED': 'checklist'
    };
    return icons[type] || 'description';
}
}