package tn.esprit.clubsync.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.BookService;
import tn.esprit.clubsync.entities.Book;

import java.util.List;

@RestController
@RequestMapping("/books")
@CrossOrigin(origins = "http://localhost:4200") // Permet à Angular d'accéder au backend

@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @PostMapping
    public ResponseEntity<Book> addBook(@RequestBody Book book) {
        return ResponseEntity.ok(bookService.addBook(book));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        return ResponseEntity.ok(bookService.updateBook(id, book));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String title) {
        return ResponseEntity.ok(bookService.searchBooks(title));
    }
    @GetMapping("/popular")  // Changed from "/recommendations" to "/popular"
    public ResponseEntity<List<Book>> getPopularBooks(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(bookService.getPopularBooks(limit));
    }


    @GetMapping("/recent")
    public ResponseEntity<List<Book>> getRecentBooks(
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(bookService.getRecentBooks(limit));
    }
}
