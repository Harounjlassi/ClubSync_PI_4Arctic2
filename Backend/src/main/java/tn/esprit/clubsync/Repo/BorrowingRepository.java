package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.clubsync.entities.Book;
import tn.esprit.clubsync.entities.Borrowing;
import tn.esprit.clubsync.entities.User;

import java.util.List;

@Repository
public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {
    List<Borrowing> findByBook(Book book);
    List<Borrowing> findByUser(User user);
    List<Borrowing> findByBookId(Long bookId);
    @Query("SELECT b FROM Borrowing b WHERE b.user.idUser = :userId")
    List<Borrowing> findByUserId(@Param("userId") Long userId);
}