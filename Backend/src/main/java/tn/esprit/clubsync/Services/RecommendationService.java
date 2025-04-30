// File: `tn.esprit.clubsync.service.RecommendationService.java`
package tn.esprit.clubsync.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.BookRepository;
import tn.esprit.clubsync.Repo.BorrowingRepository;
import tn.esprit.clubsync.entities.Book;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final BorrowingRepository borrowingRepository;
    private final BookRepository bookRepository;

    public List<Book> getPersonalizedRecommendations(Long userId) {
        // 1. Get books borrowed by the target user
        List<Long> userBooks = borrowingRepository.findByUserId(userId)
                .stream()
                .map(borrowing -> borrowing.getBook().getId())
                .collect(Collectors.toList());

        // 2. Find users with similar borrowing history
        Set<Long> similarUsers = new HashSet<>();
        for (Long bookId : userBooks) {
            borrowingRepository.findByBookId(bookId)
                    .stream()
                    .map(borrowing -> borrowing.getUser().getIdUser())
                    .forEach(similarUsers::add);
        }
        similarUsers.remove(userId); // Exclude current user

        // 3. Get books borrowed by similar users (not yet borrowed by target user)
        Map<Book, Long> recommendedBooks = new HashMap<>();
        for (Long similarUserId : similarUsers) {
            borrowingRepository.findByUserId(similarUserId)
                    .stream()
                    .filter(borrowing -> !userBooks.contains(borrowing.getBook().getId()))
                    .forEach(borrowing -> {
                        Book book = borrowing.getBook();
                        recommendedBooks.put(book, recommendedBooks.getOrDefault(book, 0L) + 1);
                    });
        }

        // 4. Sort by popularity and return top 5
        return recommendedBooks.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}