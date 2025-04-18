import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Announcement } from '../models/announcement';

@Component({
  selector: 'app-announcement-details-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.announcement.title }}</h2>
    <mat-dialog-content>
      <div class="announcement-details">
        <div class="detail-group">
          <mat-icon class="detail-icon">group</mat-icon>
          <span class="detail-label">Club:</span>
          <span class="detail-value">{{ getClubName(data.announcement.club) }}</span>
        </div>
        
        <div class="detail-group">
          <mat-icon class="detail-icon">calendar_today</mat-icon>
          <span class="detail-label">Created on:</span>
          <span class="detail-value">{{ data.announcement.createdAt | date:'medium' }}</span>
        </div>
        
        <div class="content-section">
          <h3>Announcement Content</h3>
          <p class="announcement-content">{{ data.announcement.content }}</p>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .announcement-details {
      padding: 8px;
    }
    .detail-group {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .detail-icon {
      margin-right: 8px;
      color: #3f51b5;
    }
    .detail-label {
      font-weight: 500;
      margin-right: 8px;
      color: rgba(0, 0, 0, 0.6);
    }
    .content-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
    h3 {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.8);
    }
    .announcement-content {
      white-space: pre-line;
      line-height: 1.5;
    }
  `]
})
export class AnnouncementDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AnnouncementDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { announcement: Announcement }
  ) {}
  
  getClubName(club: any): string {
    if (!club) return 'N/A';
    
    if (typeof club === 'object') {
      return club?.name || 'N/A';
    }
    
    return 'N/A';
  }
}