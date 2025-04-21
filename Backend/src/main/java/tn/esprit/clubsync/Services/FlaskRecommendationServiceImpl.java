package tn.esprit.clubsync.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.esprit.clubsync.Repo.ClubRepo;
import tn.esprit.clubsync.entities.Club;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FlaskRecommendationServiceImpl implements iClubRecommendationService {

    @Value("${recommendation.service.url:http://localhost:5000}")
    private String recommendationServiceUrl;

    @Autowired
    private ClubRepo clubRepo;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public List<Club> recommendClubsByCategory(Long userId, int maxRecommendations) {
        try {
            // Appel au microservice Flask
            String url = String.format("%s/recommend?user_id=%d&max_recommendations=%d",
                    recommendationServiceUrl, userId, maxRecommendations);

            // Récupérer les recommandations du service Flask
            ResponseEntity<Map[]> response = restTemplate.getForEntity(url, Map[].class);
            Map<String, Object>[] recommendations = response.getBody();

            if (recommendations == null || recommendations.length == 0) {
                return new ArrayList<>();
            }

            // Extraire les IDs des clubs recommandés
            List<Long> recommendedClubIds = Arrays.stream(recommendations)
                    .map(map -> ((Number) map.get("club_id")).longValue())
                    .collect(Collectors.toList());

            // Récupérer les objets Club à partir des IDs
            return recommendedClubIds.stream()
                    .map(id -> clubRepo.findById(id).orElse(null))
                    .filter(club -> club != null)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            // Gestion des erreurs
            System.err.println("Erreur lors de l'appel au service de recommandation: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}