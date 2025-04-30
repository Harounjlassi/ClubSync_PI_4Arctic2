import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RequestService } from '../services/request.service';
import { Request, RequestStatus } from '../models/request';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css']
})
export class RequestListComponent implements OnInit {
  requests: Request[] = [];
  editingRequestId: number | null = null;
  statusOptions = Object.values(RequestStatus);
  selectedStatus: string = RequestStatus.PENDING;  // Default to 'PENDING'
  feedback: string = '';

  constructor(
    private requestService: RequestService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRequests();  // Call to load all requests
  }

  loadRequests(): void {
    this.requestService.getRequests(this.selectedStatus).subscribe({
      next: (data) => {
        this.requests = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading requests:', err)
    });
  }

  startEdit(request: Request): void {
    if (!request.id) {
      console.error('Cannot edit - request has no ID');
      return;
    }
    this.editingRequestId = request.id;
    this.selectedStatus = request.status || RequestStatus.PENDING;
    this.feedback = request.adminFeedback || '';
  }

  cancelEdit(): void {
    this.editingRequestId = null;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
  }
  
  updateStatus(requestId?: number): void {
    const idToUpdate = requestId || this.editingRequestId;

    if (!idToUpdate) {
      console.error('No request ID available for update');
      alert('No request ID available for update');
      return;
    }

    this.requestService.updateRequestStatus(
      idToUpdate,
      this.selectedStatus,
      this.feedback
    ).subscribe({
      next: (updatedRequest) => {
        console.log('Update successful:', updatedRequest);
        this.requests = this.requests.map(r => 
          r.id === updatedRequest.id ? updatedRequest : r
        );
        this.editingRequestId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Update failed! Check console for details.');
      }
    });
  }
}
