package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.clubsync.entities.Review;

import java.util.List;
import java.util.Optional;


public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBookId(Long bookId);

    @Query("SELECT r FROM Review r WHERE r.user.idUser = :userId")
    List<Review> findByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM Review r WHERE r.book.id = :bookId AND r.user.idUser = :userId")
    Optional<Review> findByBookIdAndUserId(@Param("bookId") Long bookId, @Param("userId") Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.id = ?1")
    Double getAverageRatingByBookId(Long bookId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
            "FROM Review r WHERE r.book.id = :bookId AND r.user.idUser = :userId")
    boolean existsByBookIdAndUserId(@Param("bookId") Long bookId, @Param("userId") Long userId);


    @Query("SELECT r FROM Review r ORDER BY r.reviewDate DESC")
    List<Review> findAllReviews();

}