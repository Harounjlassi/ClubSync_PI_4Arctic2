package tn.esprit.clubsync.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.ReviewService;
import tn.esprit.clubsync.entities.Review;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:4200") // Pour permettre l'accès depuis Angular
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public Review createReview(@RequestBody Review review) {
        System.out.println("fffffffffffffffffffffffffffffffff");
        System.out.println(review);

        return reviewService.createReview(review);
    }

    @PutMapping("/{id}")
    public Review updateReview(@PathVariable Long id, @RequestBody Review review) {
        return reviewService.updateReview(id, review);
    }

    @DeleteMapping("/{id}")
    public void deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }

    @GetMapping("/book/{bookId}")
    public List<Review> getBookReviews(@PathVariable Long bookId) {
        return reviewService.getBookReviews(bookId);
    }

    @GetMapping("/user/{userId}")
    public List<Review> getUserReviews(@PathVariable Long userId) {
        return reviewService.getUserReviews(userId);
    }

    @GetMapping("/book/{bookId}/average-rating")
    public Double getBookAverageRating(@PathVariable Long bookId) {
        return reviewService.getBookAverageRating(bookId);
    }

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }
}