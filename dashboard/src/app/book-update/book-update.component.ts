import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../services/book.service';
import { Book } from '../models/book';

@Component({
  selector: 'app-book-update',
  templateUrl: './book-update.component.html',
  styleUrls: ['./book-update.component.css']
})
export class BookUpdateComponent implements OnInit {
  book: Book = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationDate: null,
    genre: '',
    description: '',
    language: '',
    pageCount: 0,
    available: true,
    totalCopies: 1,
    availableCopies: 1,
    coverImageUrl: ''
  };
  
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.bookService.getBookById(bookId).subscribe({
        next: (data) => {
          this.book = data;
        },
        error: (err) => {
          this.errorMessage = 'Error fetching book data.';
          console.error(err);
        }
      });
    }
  }

  updateBook() {
    this.isSubmitting = true;
    this.errorMessage = null;
    
    const bookId = this.route.snapshot.paramMap.get('id');
    
    if (bookId) {
      // Convert the bookId to a number (as it comes as a string from the URL)
      const numericBookId = +bookId;
  
      // Pass the numeric ID to the service method
      this.bookService.updateBook(numericBookId, this.book).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/books']); // Navigate to the book list after successful update
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update book. Please try again.';
          console.error('Update book error:', err);
        }
      });
    }
  }
  
}
