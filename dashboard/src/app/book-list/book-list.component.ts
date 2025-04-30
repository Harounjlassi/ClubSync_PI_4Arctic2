import { Component, OnInit } from '@angular/core';
import { BookService } from '../services/book.service';
import { Router } from '@angular/router';
import { BorrowingService } from '../services/borrowing.service';
import { Book } from '../models/book';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private bookService: BookService,
    private router: Router,
    private borrowingService: BorrowingService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.bookService.getBooks().subscribe({
      next: (data: Book[]) => {
        this.books = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load books.';
        this.isLoading = false;
        console.error('Error loading books:', err);
      }
    });
  }

  getImageUrl(book: Book): string {
    if (!book.coverImageUrl) {
      return 'assets/book-covers/default-book-cover.jpg';
    }
    
    // If it's already a full URL
    if (book.coverImageUrl.startsWith('http')) {
      return book.coverImageUrl;
    }
    
    // If it's from Spring Boot uploads
    if (book.coverImageUrl.includes('uploads')) {
      return `http://localhost:8080${book.coverImageUrl.startsWith('/') ? '' : '/'}${book.coverImageUrl}`;
    }
    
    // Default case (assets)
    return book.coverImageUrl;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/book-covers/default-book-cover.jpg';
  }
  // Updated to handle string | null | undefined
  formatDate(dateString?: string | null): string {
    if (!dateString) return 'Unknown';
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  }

  goToUpdatePage(bookId: number): void {
    this.router.navigate(['/update-book', bookId]);
  }

  deleteBook(bookId: number): void {
    if (!confirm('Are you sure you want to delete this book?')) return;
    this.bookService.deleteBook(bookId).subscribe({
      next: () => {
        this.books = this.books.filter(b => b.id !== bookId);
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete book.';
        console.error('Error deleting book:', err);
      }
    });
  }

  viewReviews(bookId: number): void {
    this.router.navigate(['/reviews', bookId]);
  }

  borrowBook(bookId: number): void {
    const userId = 8; // In a real app, get from auth service
    this.borrowingService.borrowBook(userId, bookId).subscribe({
      next: () => this.loadBooks(),
      error: (err) => {
        this.errorMessage = 'Error borrowing book';
        console.error('Error borrowing book:', err);
      }
    });
  }

  navigateToAddBook(): void {
    this.router.navigate(['/add-book']);
  }
}