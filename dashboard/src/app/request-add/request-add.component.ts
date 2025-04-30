import { Component } from '@angular/core';
import { RequestService } from '../services/request.service';
import { Router } from '@angular/router';
import { Request } from '../models/request';

@Component({
  selector: 'app-request-add',
  templateUrl: './request-add.component.html',
  styleUrls: ['./request-add.component.css']
})
export class RequestAddComponent {
  request: Request = {
    user: { idUser: 6 }, // Get this from your auth service in real app
    title: '',
    author: ''
    // Other fields will use their default values
  };

  constructor(
    private requestService: RequestService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.requestService.createRequest(this.request).subscribe({
      next: () => {
        alert('Request submitted successfully!');
        this.router.navigate(['/front/books']);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error submitting request: ' + (error.error?.message || error.message));
      }
    });
  }
  navigateToRec() {
    this.closeDropdown();
    this.router.navigate(['/reclamationf']);
  }
  closeDropdown() {
    throw new Error('Method not implemented.');
  }
}