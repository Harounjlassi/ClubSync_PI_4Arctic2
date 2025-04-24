package tn.esprit.clubsync.Services;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class JokeServiceImpl implements JokeService {

    private final WebClient webClient;

    public JokeServiceImpl(WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public String getRandomJoke() {
        String url = "https://v2.jokeapi.dev/joke/Any?type=single";

        Mono<Map> responseMono = webClient
                .get()
                .uri(url)
                .retrieve()
                .bodyToMono(Map.class);

        Map<String, Object> response = responseMono.block(); // Bloc synchrone
        return (String) response.get("joke");
    }
}