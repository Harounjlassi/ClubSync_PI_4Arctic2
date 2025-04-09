// update-user.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserResponse } from '../models/user-response.model';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {
  updateForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  userId: number;
  user: UserResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    this.updateForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
      dateNaissance: [''],
      sexe: ['Homme'],
      numeroDeTelephone: [0],
      id_role: [0],
      photoProfil: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.updateForm.patchValue({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          dateNaissance: user.dateNaissance ? new Date(user.dateNaissance) : '',
          sexe: user.sexe || 'Homme',
          numeroDeTelephone: user.numeroDeTelephone || 0,
          id_role: user.role || 0
        });
        
        if (user.photoProfil) {
          this.imagePreview = user.photoProfil;
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.updateForm.invalid) {
      return;
    }

    const formValue = this.updateForm.value;
    
    const userRequest = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      email: formValue.email,
      password: formValue.password || undefined, // Only include if changed
      dateNaissance: formValue.dateNaissance ? new Date(formValue.dateNaissance).toISOString() : null,
      sexe: formValue.sexe,
      numeroDeTelephone: Number(formValue.numeroDeTelephone),
      id_role: Number(formValue.id_role),
      photoProfil: this.user?.photoProfil || ''
    };

    // Remove password if not provided
    if (!userRequest.password) {
      delete userRequest.password;
    }

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        userRequest.photoProfil = reader.result as string;
        this.updateUser(userRequest);
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.updateUser(userRequest);
    }
  }

  private updateUser(user: any): void {
    this.isLoading = true;
    this.userService.updateUser(this.userId, user).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/user-list']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error updating user:', err);
      }
    });
  }

  cancelUpdate(): void {
    this.router.navigate(['/user-list']);
  }
}