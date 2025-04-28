import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AnnouncementService } from '../services/announcement.service';
import { ClubService } from '../services/club.service';
import { ToastrService } from 'ngx-toastr';
import { Club } from '../models/club.model';
import { Announcement } from '../models/announcement';

@Component({
  selector: 'app-edit-announcement-dialog',
  templateUrl: './edit-announcement-dialog.component.html',
  styleUrls: ['./edit-announcement-dialog.component.css']
})
export class EditAnnouncementDialogComponent implements OnInit {
  announcementForm: FormGroup;
  clubs: Club[] = [];
  isSubmitting: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private announcementService: AnnouncementService,
    private clubService: ClubService,
    public dialogRef: MatDialogRef<EditAnnouncementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { announcement: Announcement },
    private toastr: ToastrService
  ) {}
  
  ngOnInit(): void {
    this.loadClubs();
    
    this.announcementForm = this.fb.group({
      title: [this.data.announcement.title, [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
        this.noConsecutiveSpaces
      ]],
      content: [this.data.announcement.content, [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(1000),
        this.noConsecutiveSpaces
      ]],
      clubId: [
        typeof this.data.announcement.club === 'object' && this.data.announcement.club !== null
          ? this.data.announcement.club.id_club
          : this.data.announcement.club || '',
        Validators.required
      ]    });
  }
  
  loadClubs(): void {
    this.clubService.getAllClubs().subscribe({
      next: (data: Club[]) => {
        this.clubs = data;
      },
      error: (error) => {
        console.error('Error loading clubs:', error);
        this.toastr.error('Failed to load clubs', 'Error');
      }
    });
  }
  
  onSubmit(): void {
    if (this.announcementForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formValues = this.announcementForm.value;
      const clubId = formValues.clubId;
      
      // Find the selected club to include complete club object
      const selectedClub = this.clubs.find(club => club.id_club === clubId);
      
      // Create updated announcement object
      const updatedAnnouncement: Announcement = {
        id: this.data.announcement.id,
        title: formValues.title,
        content: formValues.content,
        club: selectedClub // Use the full club object instead of casting
      };
      
      this.announcementService.updateAnnouncement(updatedAnnouncement.id!, updatedAnnouncement).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
          this.toastr.success('Announcement updated successfully!', 'Success', {
            timeOut: 3000,
            progressBar: true
          });
        },
        error: (error) => {
          console.error('Error updating announcement:', error);
          this.toastr.error('Failed to update announcement', 'Error');
          this.isSubmitting = false;
        },
        complete: () => this.isSubmitting = false
      });
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  // Custom validator to prevent consecutive spaces
  noConsecutiveSpaces(control: FormControl): {[key: string]: any} | null {
    const value = control.value || '';
    if (value.includes('  ')) {
      return { 'consecutiveSpaces': true };
    }
    return null;
  }
}