import { Component, OnInit } from '@angular/core';
import { BookService } from '../services/book.service';
import { Router } from '@angular/router';
import { BorrowingService } from '../services/borrowing.service';
import { Book } from '../models/book';

@Component({
  selector: 'app-book-list-front',
  templateUrl: './book-list-front.component.html',
  styleUrls: ['./book-list-front.component.css']
})
export class BookListFrontComponent implements OnInit {
  books: Book[] = [];
  popularBooks: Book[] = [];       // For popular books (most borrowed)
  personalizedBooks: Book[] = [];  // For personalized recommendations
  recentBooks: Book[] = [];  
  searchQuery: string = '';
searchResults: Book[] = [];
isSearching: boolean = false;      // For recently added books

  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private bookService: BookService,
    private router: Router,
    private borrowingService: BorrowingService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadPopularBooks();
    this.loadPersonalizedRecommendations();
    this.loadRecentBooks();
  }
  navigateToRec() {
    this.closeDropdown();
    this.router.navigate(['/reclamationf']);
  }
  closeDropdown() {
    throw new Error('Method not implemented.');
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

  // Load popular books (most borrowed)
  loadPopularBooks(): void {
    this.bookService.getPopularBooks(5).subscribe({
      next: (books) => {
        this.popularBooks = books;
        console.log('Popular books loaded:', books);
      },
      error: (err) => {
        console.error('Error loading popular books:', err);
      }
    });
  }

  // Load personalized recommendations
  loadPersonalizedRecommendations(): void {
    const userId = 6; // Replace with actual user ID from auth service
    this.bookService.getPersonalizedRecommendations(userId).subscribe({
      next: (books) => {
        this.personalizedBooks = books;
        console.log('Personalized recommendations loaded:', books);
      },
      error: (err) => {
        console.error('Error loading personalized recommendations:', err);
        // You might want to load a fallback here if personalized recs fail
      }
    });
  }

  // Load recently added books
  loadRecentBooks(): void {
    this.bookService.getRecentBooks(4).subscribe({
      next: (books) => {
        this.recentBooks = books;
        console.log('Recent books loaded:', books);
      },
      error: (err) => {
        console.error('Error loading recent books:', err);
      }
    });
  }

  // Utility methods remain the same
  getImageUrl(book: Book): string {
    if (!book.coverImageUrl) {
      return 'assets/book-covers/default-book-cover.jpg';
    }
    
    if (book.coverImageUrl.startsWith('http')) {
      return book.coverImageUrl;
    }
    
    if (book.coverImageUrl.includes('uploads')) {
      return `http://localhost:8080${book.coverImageUrl.startsWith('/') ? '' : '/'}${book.coverImageUrl}`;
    }
    
    return book.coverImageUrl;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/book-covers/default-book-cover.jpg';
  }

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

  borrowBook(bookId: number): void {
    const userId = 1; // In a real app, get from auth service
    this.borrowingService.borrowBook(userId, bookId).subscribe({
      next: () => this.loadBooks(),
      error: (err) => {
        this.errorMessage = 'Error borrowing book';
        console.error('Error borrowing book:', err);
      }
    });
  }

  viewDetails(bookId: number): void {
    this.router.navigate(['/front/books', bookId]);
  }

  viewReviews(bookId: number): void {
    this.router.navigate(['/front/reviews', bookId]);
  }

  addReview(bookId: number): void {
    this.router.navigate(['/front/reviews/add', bookId]);
  }

  openGeneralRequest(): void {
    this.router.navigate(['/front/request-book']);
  }
  searchBooks(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
  
    this.isSearching = true;
    this.bookService.searchBooks(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Search failed:', err);
        this.isSearching = false;
      }
    });
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }
  booksToDisplay(): Book[] {
    if (this.searchQuery.trim() && this.searchResults.length > 0) {
      return this.searchResults;
    }
    return this.books;
  }
}