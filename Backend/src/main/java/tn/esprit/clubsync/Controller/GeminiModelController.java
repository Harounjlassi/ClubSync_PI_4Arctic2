package tn.esprit.clubsync.Controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import tn.esprit.clubsync.entities.GeminiModel;

import java.util.List;

@RestController
public class GeminiModelController {

    private static final Logger log = LoggerFactory.getLogger(GeminiModelController.class);
    @Value("${spring.ai.openai.api-key}")
    private String GEMINI_API_KEY;
    private final RestClient restClient;

    public GeminiModelController(RestClient.Builder builder) {
        log.info("GeminiModelController...");
        this.restClient = builder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    /*
        curl https://generativelanguage.googleapis.com/v1beta/openai/models \                                                                                                                                                                                                  ✔  10s   base 
        -H "Authorization: Bearer GEMINI_API_KEY"
     */
    @GetMapping("/models")
    public List<GeminiModel> models() {
        ResponseEntity<ModelListResponse> response = restClient.get()
                .uri("/v1beta/openai/models")
                .header("Authorization","Bearer " + GEMINI_API_KEY)
                .retrieve()
                .toEntity(ModelListResponse.class);
        return response.getBody().data();
    }

}
