package tn.esprit.clubsync.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.BookRepository;
import tn.esprit.clubsync.Repo.BorrowingRepository;
import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.entities.Book;
import tn.esprit.clubsync.entities.Borrowing;
import tn.esprit.clubsync.entities.User;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowingService {
    private final BorrowingRepository borrowingRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    // Borrow a book (decrease available copies by 1)
    public Borrowing borrowBook(Long userId, Long bookId) {
        // Fetch the user and the book
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // Ensure there's at least one available copy of the book
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No available copies for this book");
        }

        // Decrease the available copies by 1
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);  // Save the updated book

        // Create a new borrowing record
        Borrowing borrowing = new Borrowing();
        borrowing.setBook(book);
        borrowing.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")));
        borrowing.setBorrowDate(LocalDate.now());
        borrowing.setReturned(false);

        return borrowingRepository.save(borrowing);  // Save the borrowing record
    }

    // Return a book (increase available copies by 1)
    public Borrowing returnBook(Long borrowingId) {
        Borrowing borrowing = borrowingRepository.findById(borrowingId)
                .orElseThrow(() -> new RuntimeException("Borrowing record not found"));

        // Mark the book as returned
        if (borrowing.getReturned()) {
            throw new RuntimeException("Book is already returned");
        }

        // Increase available copies by 1
        Book book = borrowing.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);  // Save the updated book

        // Mark the borrowing as returned and set return date
        borrowing.setReturned(true);
        borrowing.setReturnDate(LocalDate.now());

        return borrowingRepository.save(borrowing);  // Save the updated borrowing record
    }
    // Get all borrowings
    public List<Borrowing> getAllBorrowings() {
        return borrowingRepository.findAll();
    }

    // Get borrowing by ID
    public Borrowing getBorrowingById(Long id) {
        return borrowingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrowing not found"));
    }

    // Get borrowings by book ID
    public List<Borrowing> getBorrowingsByBookId(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        return borrowingRepository.findByBook(book);
    }

    // Get borrowings by user ID
    public List<Borrowing> getBorrowingsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return borrowingRepository.findByUser(user);
    }
}
