import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nom: [''],
      prenom: [''],
      email: [''],
      password: [''],
      confirmPassword: [''],
      dateNaissance: [''],
      sexe: ['Homme'],
      numeroDeTelephone: [0],
      id_role: [0],
      photoProfil: ['']
    });
  }

  ngOnInit(): void {}

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
    const formValue = this.registerForm.value;

    const userRequest = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      email: formValue.email,
      password: formValue.password,
      dateNaissance: new Date(formValue.dateNaissance).toISOString(),
      sexe: formValue.sexe,
      numeroDeTelephone: Number(formValue.numeroDeTelephone),
      id_role: Number(formValue.id_role),
      photoProfil: ''
    };

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        userRequest.photoProfil = reader.result as string;
        this.registerUser(userRequest);
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.registerUser(userRequest);
    }
  }

  private registerUser(user: any): void {
    this.isLoading = true;
    this.userService.register(user).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur lors de l\'enregistrement :', err);
      }
    });
  }
}
