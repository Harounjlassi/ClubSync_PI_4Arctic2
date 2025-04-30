package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.Query;
import tn.esprit.clubsync.entities.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByIsbn(String isbn);
    List<Book> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT b FROM Book b LEFT JOIN Borrowing br ON b.id = br.book.id " +
            "GROUP BY b.id ORDER BY COUNT(br.id) DESC")
    List<Book> findPopularBooks(Pageable pageable);

    @Query("SELECT b FROM Book b ORDER BY b.id DESC")
    List<Book> findRecentBooks(Pageable pageable);
}