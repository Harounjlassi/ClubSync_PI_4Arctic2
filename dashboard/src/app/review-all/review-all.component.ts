import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review';

@Component({
  selector: 'app-review-all',
  templateUrl: './review-all.component.html',
  styleUrls: ['./review-all.component.css']
})
export class ReviewAllComponent implements OnInit {
  reviews: Review[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getAllReviews().subscribe({
      next: data => {
        this.reviews = data;
        this.isLoading = false;
      },
      error: err => {
        this.errorMessage = 'Failed to load reviews';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}
