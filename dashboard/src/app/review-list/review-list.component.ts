import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../services/review.service';
import { BookService } from '../services/book.service';
import { Review } from '../models/review';
import { Book } from '../models/book';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent implements OnInit {
  bookId!: number;
  book: Book | null = null;
  reviews: Review[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.bookId = +params['bookId'];
      if (this.bookId) {
        this.loadBookDetails(this.bookId);
        this.loadBookReviews(this.bookId);
      }
    });
  }

  loadBookDetails(bookId: number) {
    this.bookService.getBookById(bookId.toString()).subscribe(
      book => {
        this.book = book;
      },
      error => {
        console.error('Error loading book details:', error);
      }
    );
  }

  loadBookReviews(bookId: number) {
    this.isLoading = true;
    this.reviewService.getBookReviews(bookId).subscribe(
      reviews => {
        this.reviews = reviews;
        this.isLoading = false;
      },
      error => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      }
    );
  }

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

  deleteReview(reviewId: number) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(reviewId).subscribe(
        () => {
          this.loadBookReviews(this.bookId);
        },
        (error) => {
          console.error('Error deleting review:', error);
        }
      );
    }
  }
}