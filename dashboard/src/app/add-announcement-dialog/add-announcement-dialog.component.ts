import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AnnouncementService } from '../services/announcement.service';
import { ClubService } from '../services/club.service';
import { ToastrService } from 'ngx-toastr';
import { Club } from '../models/club.model';
import { Announcement } from '../models/announcement';

@Component({
  selector: 'app-add-announcement-dialog',
  templateUrl: './add-announcement-dialog.component.html',
  styleUrls: ['./add-announcement-dialog.component.css']
})
export class AddAnnouncementDialogComponent implements OnInit {
  announcementForm: FormGroup;
  clubs: Club[] = [];
  isSubmitting: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private announcementService: AnnouncementService,
    private clubService: ClubService,
    public dialogRef: MatDialogRef<AddAnnouncementDialogComponent>,
    private toastr: ToastrService
  ) {}
  
  ngOnInit(): void {
    this.loadClubs();
    
    this.announcementForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
        this.noConsecutiveSpaces,
        Validators.pattern(/^[\S]+(?:[\s][\S]+)*$/) // Bloque les espaces en début/fin
      ]],
      content: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(1000),
        this.noConsecutiveSpaces,
        Validators.pattern(/^[\S]+(?:[\s][\S]+)*$/m) // Validation multi-ligne
      ]],
      clubId: ['', [
        Validators.required,
        Validators.pattern(/^[1-9]\d*$/) // Bloque les IDs <= 0
      ]]
    });
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
      
      console.log("Valeurs du formulaire:", JSON.stringify(formValues));
      console.log("Club ID sélectionné:", clubId);
      
      // Create announcement object
      const announcement: Announcement = {
        title: formValues.title,
        content: formValues.content
      };
      
      console.log("Objet annonce à envoyer:", JSON.stringify(announcement));
      
      this.announcementService.addAnnouncement(clubId, announcement).subscribe({
        next: (result) => {
          console.log("Résultat de l'ajout:", JSON.stringify(result));
          this.dialogRef.close(result);
          this.toastr.success('Announcement added successfully!', 'Success');
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout:', error);
          this.toastr.error('Failed to add announcement', 'Error');
          this.isSubmitting = false;
        },
        complete: () => this.isSubmitting = false
      });
    } else {
      console.log("Formulaire invalide:", this.announcementForm.errors);
    }
  }
  onCancel(): void {
    this.dialogRef.close();
  }
  
  // Custom validator to prevent consecutive spaces
  noConsecutiveSpaces(control: FormControl): ValidationErrors | null {
    const value = control.value || '';
    if (
      value.trim().length < 1 || 
      /^\s*$/.test(value) || 
      value.indexOf('  ') > -1
    ) {
      return { 'invalidSpaces': true };
    }
    return null;
  }
}