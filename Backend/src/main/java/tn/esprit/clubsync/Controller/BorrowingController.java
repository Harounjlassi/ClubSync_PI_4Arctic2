package tn.esprit.clubsync.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.BorrowingService;
import tn.esprit.clubsync.entities.Borrowing;

import java.util.List;

@RestController
@RequestMapping("/borrowings")
@CrossOrigin(origins = "http://localhost:4200") // Permet à Angular d'accéder au backend

@RequiredArgsConstructor
public class BorrowingController {
    private final BorrowingService borrowingService;

    // Borrow a book
    @PostMapping("/borrow")
    public ResponseEntity<Borrowing> borrowBook(@RequestParam Long userId, @RequestParam Long bookId) {
        Borrowing borrowing = borrowingService.borrowBook(userId, bookId);
        return ResponseEntity.ok(borrowing);
    }

    // Return a book
    @PostMapping("/return/{borrowingId}")
    public ResponseEntity<Borrowing> returnBook(@PathVariable Long borrowingId) {
        Borrowing borrowing = borrowingService.returnBook(borrowingId);
        return ResponseEntity.ok(borrowing);
    }

    // Get all borrowings
    @GetMapping
    public ResponseEntity<List<Borrowing>> getAllBorrowings() {
        return ResponseEntity.ok(borrowingService.getAllBorrowings());
    }

    // Get borrowing by ID
    @GetMapping("/{id}")
    public ResponseEntity<Borrowing> getBorrowingById(@PathVariable Long id) {
        return ResponseEntity.ok(borrowingService.getBorrowingById(id));
    }

    // Get borrowings by book ID
    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<Borrowing>> getBorrowingsByBookId(@PathVariable Long bookId) {
        return ResponseEntity.ok(borrowingService.getBorrowingsByBookId(bookId));
    }

    // Get borrowings by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Borrowing>> getBorrowingsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowingService.getBorrowingsByUserId(userId));
    }

}
