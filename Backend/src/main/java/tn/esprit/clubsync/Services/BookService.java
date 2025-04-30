package tn.esprit.clubsync.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.BookRepository;
import tn.esprit.clubsync.entities.Book;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
    }

    public Book addBook(Book book) {
        if (bookRepository.existsByIsbn(book.getIsbn())) {
            throw new RuntimeException("ISBN already exists");
        }
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book bookDetails) {
        Book book = getBookById(id);
        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setIsbn(bookDetails.getIsbn());
        book.setPublisher(bookDetails.getPublisher());
        book.setPublicationDate(bookDetails.getPublicationDate());
        book.setGenre(bookDetails.getGenre());
        book.setDescription(bookDetails.getDescription());  // Update description
        book.setLanguage(bookDetails.getLanguage());
        book.setPageCount(bookDetails.getPageCount());
        book.setTotalCopies(bookDetails.getTotalCopies());
        book.setAvailableCopies(bookDetails.getAvailableCopies());
        book.setCoverImageUrl(bookDetails.getCoverImageUrl());
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    public List<Book> searchBooks(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }
    public List<Book> getPopularBooks(int limit) {
        return bookRepository.findPopularBooks(PageRequest.of(0, limit));
    }
    public List<Book> getRecentBooks(int limit) {
        return bookRepository.findRecentBooks(PageRequest.of(0, limit));
    }

    private final RecommendationService recommendationService; // Add to constructor

    public List<Book> getPersonalizedRecommendations(Long userId) {
        return recommendationService.getPersonalizedRecommendations(userId);
    }
}