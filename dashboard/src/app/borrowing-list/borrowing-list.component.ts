import { Component, OnInit } from '@angular/core';
import { Borrowing } from '../models/borrowing';
import { BorrowingService } from '../services/borrowing.service';

@Component({
  selector: 'app-borrowing-list',
  templateUrl: './borrowing-list.component.html',
  styleUrls: ['./borrowing-list.component.css']
})
export class BorrowingListComponent implements OnInit {
  borrowings: Borrowing[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private borrowingService: BorrowingService) {}

  ngOnInit(): void {
    this.loadBorrowings();
  }

  loadBorrowings(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.borrowingService.getAllBorrowings().subscribe({
      next: (data) => {
        this.borrowings = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load borrowings';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  returnBook(borrowingId: number): void {
    if (!confirm('Are you sure you want to return this book?')) return;

    this.borrowingService.returnBook(borrowingId).subscribe({
      next: () => {
        this.successMessage = 'Book returned successfully';
        this.loadBorrowings(); // Refresh the list
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to return book';
        console.error(err);
      }
    });
  }
}