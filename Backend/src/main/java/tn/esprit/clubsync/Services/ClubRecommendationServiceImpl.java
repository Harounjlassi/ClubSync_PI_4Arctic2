package tn.esprit.clubsync.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.esprit.clubsync.entities.Club;
import tn.esprit.clubsync.entities.Users;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.logging.Logger;
import java.util.logging.Level;

@Service
public class ClubRecommendationServiceImpl implements iClubRecommendationService {

    private static final Logger logger = Logger.getLogger(ClubRecommendationServiceImpl.class.getName());

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private iClubService clubService;

    @Value("${recommendation.service.url:http://localhost:5000}")
    private String recommendationServiceUrl;

    @Value("${recommendation.service.enabled:true}")
    private boolean recommendationServiceEnabled;

    @Override
    public List<Club> recommendClubsByCategory(Long userId, int maxRecommendations) {
        if (!recommendationServiceEnabled) {
            logger.info("Service de recommandation désactivé. Utilisation de la méthode de secours.");
            return fallbackRecommendation(userId, maxRecommendations);
        }

        try {
            // Appeler le service de recommandation ML
            String url = recommendationServiceUrl + "/recommend?user_id=" + userId + "&max=" + maxRecommendations;
            logger.info("Appel au service de recommandation: " + url);

            // Utiliser ParameterizedTypeReference pour capturer la liste complexe
            ResponseEntity<List<Map<String, Object>>> responseEntity =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            null,
                            new ParameterizedTypeReference<List<Map<String, Object>>>() {}
                    );

            List<Map<String, Object>> recommendations = responseEntity.getBody();

            if (recommendations == null || recommendations.isEmpty()) {
                logger.info("Aucune recommandation reçue du service ML pour l'utilisateur " + userId);
                return new ArrayList<>();
            }

            // Log des recommandations reçues
            logger.info("Recommandations reçues pour l'utilisateur " + userId + ": " + recommendations.size());

            // Convertir les recommandations en objets Club
            List<Club> recommendedClubs = recommendations.stream()
                    .map(rec -> {
                        // Extraire club_id comme Long, en gérant différents types possibles
                        Long clubId;
                        Object idObj = rec.get("club_id");
                        if (idObj instanceof Integer) {
                            clubId = ((Integer) idObj).longValue();
                        } else if (idObj instanceof Long) {
                            clubId = (Long) idObj;
                        } else if (idObj instanceof String) {
                            clubId = Long.parseLong((String) idObj);
                        } else if (idObj instanceof Double) {
                            clubId = ((Double) idObj).longValue();
                        } else {
                            logger.warning("Type d'ID non reconnu pour un club: " +
                                    (idObj != null ? idObj.getClass().getName() : "null"));
                            clubId = null;
                        }

                        if (clubId != null) {
                            // Tracer la méthode et le score de recommandation
                            String method = (String) rec.getOrDefault("recommendation_method", "unknown");
                            Double score = (Double) rec.getOrDefault("recommendation_score", 0.0);
                            logger.info("Club ID " + clubId + " recommandé avec méthode: " + method + ", score: " + score);

                            return clubService.retrieveClub(clubId);
                        }
                        return null;
                    })
                    .filter(club -> club != null)
                    .collect(Collectors.toList());

            return recommendedClubs;

        } catch (Exception e) {
            // En cas d'erreur, utiliser la méthode de recommandation de base
            logger.log(Level.SEVERE, "Erreur lors de l'appel au service de recommandation ML: " + e.getMessage(), e);
            return fallbackRecommendation(userId, maxRecommendations);
        }
    }

    // Méthode de secours qui utilise l'approche basique originale
    private List<Club> fallbackRecommendation(Long userId, int maxRecommendations) {
        logger.info("Utilisation de la méthode de recommandation de secours pour l'utilisateur " + userId);

        // Récupérer tous les clubs
        List<Club> allClubs = clubService.retrieveAllClub();

        // Récupérer les clubs dont l'utilisateur est déjà membre
        List<Club> userClubs = allClubs.stream()
                .filter(club -> club.getMembers() != null &&
                        club.getMembers().stream().anyMatch(member -> member.getId().equals(userId)))
                .collect(Collectors.toList());

        // Si l'utilisateur n'est membre d'aucun club, retourner les premiers clubs disponibles
        if (userClubs.isEmpty()) {
            logger.info("L'utilisateur " + userId + " n'est membre d'aucun club, recommandation des premiers clubs disponibles");
            return allClubs.stream().limit(maxRecommendations).collect(Collectors.toList());
        }

        // Récupérer les catégories des clubs de l'utilisateur
        List<String> userCategories = userClubs.stream()
                .map(Club::getCategorie)
                .distinct()
                .collect(Collectors.toList());

        logger.info("Catégories des clubs de l'utilisateur " + userId + ": " + String.join(", ", userCategories));

        // Recommander des clubs de mêmes catégories que l'utilisateur n'a pas encore rejoints
        List<Club> recommendations = allClubs.stream()
                .filter(club -> userCategories.contains(club.getCategorie()))
                .filter(club -> club.getMembers() == null ||
                        club.getMembers().stream().noneMatch(member -> member.getId().equals(userId)))
                .limit(maxRecommendations)
                .collect(Collectors.toList());

        logger.info("Recommandations générées pour l'utilisateur " + userId + ": " + recommendations.size() + " clubs");
        return recommendations;
    }

    // Réentraîner le modèle périodiquement (par exemple, une fois par jour à 1h00 du matin)
    @Scheduled(cron = "0 0 1 * * ?")
    public void retrainModel() {
        if (!recommendationServiceEnabled) {
            logger.info("Service de recommandation désactivé. Réentraînement ignoré.");
            return;
        }

        try {
            logger.info("Début du réentraînement programmé du modèle de recommandation");
            String url = recommendationServiceUrl + "/retrain";
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            Map<String, Object> result = response.getBody();
            if (result != null && "success".equals(result.get("status"))) {
                logger.info("Réentraînement du modèle réussi: " + result.get("message"));
            } else {
                logger.warning("Réentraînement du modèle terminé avec un résultat inattendu: " + result);
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Erreur lors du réentraînement du modèle: " + e.getMessage(), e);
        }
    }
}