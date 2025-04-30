import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../services/review.service';
import { BookService } from '../services/book.service';
import { Review } from '../models/review';
import { Book } from '../models/book';

@Component({
  selector: 'app-review-add',
  templateUrl: './review-add.component.html',
  styleUrls: ['./review-add.component.css']
})
export class ReviewAddComponent implements OnInit {
  bookId!: number;  // Declare bookId but leave it undefined initially
  bookName: string = '';  // Initialize bookName
  newReview: Review = {
   // id: undefined,  // Ensure id is undefined initially (optional)
    book: { id: 0 },  // Book id is initialized with 0, will be updated later
    user: { id: 6 },  // Use default user for testing (temporary)
    rating: 1,
    comment: '',
    reviewDate: new Date(),
    edited: false,
  };

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    private bookService: BookService,  // Inject book service
    private router: Router
  ) {}

  ngOnInit() {
    // Get bookId from the route
    this.route.params.subscribe(params => {
      this.bookId = +params['bookId'];  // Convert bookId to number
      this.loadBookDetails(this.bookId);  // Load book details using the bookId
    });
  }

  // Load the book details
  loadBookDetails(bookId: number) {
    this.bookService.getBookById(bookId.toString()).subscribe(book => {
      this.bookName = book.title;  // Set the book name
      this.newReview.book = { id: book.id };  // Only assign the id of the book
    });
  }

  // Add the review
  addReview() {
    console.log("Review data: ", this.newReview);  // Log the review data
  
    if (this.newReview.rating < 1 || this.newReview.rating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }
   this.newReview.rating = Math.round(this.newReview.rating);  // Round the rating to the nearest integer
    // Call the review service to add the review
    this.reviewService.createReview(this.newReview).subscribe(
      () => {
        alert("Review added successfully!");
        this.router.navigate([`/front/reviews/${this.bookId}`]);  // Navigate to the review list
      },
      (error) => {
        console.error("Error adding review: ", error);  // Log any errors from the API call
        alert("There was an error adding the review.");
      }
    );
  }
}