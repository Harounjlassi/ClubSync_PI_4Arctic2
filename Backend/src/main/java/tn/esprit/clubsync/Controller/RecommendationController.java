// File: `tn.esprit.clubsync.controller.RecommendationController.java`
package tn.esprit.clubsync.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.RecommendationService;
import tn.esprit.clubsync.entities.Book;

import java.util.List;

@RestController
@RequestMapping("/recommendations")
@CrossOrigin(origins = "http://localhost:4200") // Permet à Angular d'accéder au backend

@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendationService;

    @GetMapping("/personalized/{userId}")
    public ResponseEntity<List<Book>> getPersonalizedRecommendations(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                recommendationService.getPersonalizedRecommendations(userId)
        );
    }
}
