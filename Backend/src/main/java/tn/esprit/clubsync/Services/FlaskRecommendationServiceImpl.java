package tn.esprit.clubsync.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import tn.esprit.clubsync.Repo.ClubRepo;
import tn.esprit.clubsync.entities.Club;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class FlaskRecommendationServiceImpl implements iClubRecommendationService {

    private static final Logger logger = Logger.getLogger(FlaskRecommendationServiceImpl.class.getName());

    @Value("${recommendation.service.url:http://localhost:5000}")
    private String recommendationServiceUrl;

    @Autowired
    private ClubRepo clubRepo;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public List<Club> recommendClubsByCategory(Long userId, int maxRecommendations) {
        try {
            // Build URI with proper encoding
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(recommendationServiceUrl + "/recommend")
                    .queryParam("user_id", userId)
                    .queryParam("max_recommendations", maxRecommendations);

            String url = builder.toUriString();
            logger.info("Calling recommendation service at: " + url);

            // Make request to Flask service
            ResponseEntity<Map[]> response = restTemplate.getForEntity(url, Map[].class);
            Map<String, Object>[] recommendations = response.getBody();

            if (recommendations == null || recommendations.length == 0) {
                logger.info("No recommendations returned for user " + userId);
                return new ArrayList<>();
            }

            logger.info("Received " + recommendations.length + " recommendations for user " + userId);

            // Extract club IDs and additional recommendation data
            List<Long> recommendedClubIds = Arrays.stream(recommendations)
                    .map(map -> {
                        Number clubId = (Number) map.get("club_id");
                        Double score = map.containsKey("recommendation_score") ?
                                ((Number) map.get("recommendation_score")).doubleValue() : 0.0;
                        String method = (String) map.get("recommendation_method");

                        logger.fine("Club ID: " + clubId + ", Score: " + score + ", Method: " + method);
                        return clubId.longValue();
                    })
                    .collect(Collectors.toList());

            // Retrieve Club objects from database
            List<Club> recommendedClubs = recommendedClubIds.stream()
                    .map(id -> {
                        try {
                            return clubRepo.findById(id).orElse(null);
                        } catch (Exception e) {
                            logger.warning("Error retrieving club with ID " + id + ": " + e.getMessage());
                            return null;
                        }
                    })
                    .filter(club -> club != null)
                    .collect(Collectors.toList());

            logger.info("Returning " + recommendedClubs.size() + " club recommendations");
            return recommendedClubs;

        } catch (RestClientException e) {
            logger.log(Level.SEVERE, "Error calling recommendation service: " + e.getMessage(), e);
            return new ArrayList<>();
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error in recommendation service: " + e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    // Optional: Add method to force retraining of the model
    public boolean retrainRecommendationModel() {
        try {
            String url = recommendationServiceUrl + "/retrain";
            ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error retraining recommendation model: " + e.getMessage(), e);
            return false;
        }
    }

    // Optional: Add method to get model information
    public Map<String, Object> getModelInfo() {
        try {
            String url = recommendationServiceUrl + "/model-info";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error getting model info: " + e.getMessage(), e);
            return null;
        }
    }
}