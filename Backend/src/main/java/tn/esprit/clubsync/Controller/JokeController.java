package tn.esprit.clubsync.Controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.clubsync.Services.JokeService;
@CrossOrigin(origins = "http://localhost:4200")
@RestController

public class JokeController {

    private final JokeService jokeService;

    public JokeController(JokeService jokeService) {
        this.jokeService = jokeService;
    }

    @GetMapping("/joke")
    public String getJoke() {
        return jokeService.getRandomJoke();
    }
}