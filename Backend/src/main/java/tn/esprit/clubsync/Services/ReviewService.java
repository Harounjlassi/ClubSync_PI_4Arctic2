package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.*;
import tn.esprit.clubsync.Repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final BookService bookService;
    private final UserRepository userRepository;

    @Transactional
    public Review createReview(Review review) {
        Long bookId = review.getBook().getId();
        Long userId = review.getUser().getIdUser();


        // Check for duplicate review
        if (reviewRepository.existsByBookIdAndUserId(bookId, userId)) {
            throw new IllegalStateException("You have already reviewed this book.");
        }



        return reviewRepository.save(review);
    }

    public Review updateReview(Long reviewId, Review reviewDetails) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (reviewDetails.getRating() != null) {
            review.setRating(reviewDetails.getRating());
            review.setEdited(true);
        }

        if (reviewDetails.getComment() != null) {
            review.setComment(reviewDetails.getComment());
            review.setEdited(true);
        }

        return reviewRepository.save(review);
    }

    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    public List<Review> getBookReviews(Long bookId) {
        return reviewRepository.findByBookId(bookId);
    }

    public List<Review> getUserReviews(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    public Double getBookAverageRating(Long bookId) {
        return reviewRepository.getAverageRatingByBookId(bookId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAllReviews();
    }
}
