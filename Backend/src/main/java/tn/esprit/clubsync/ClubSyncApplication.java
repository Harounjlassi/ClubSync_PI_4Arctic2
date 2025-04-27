package tn.esprit.clubsync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class ClubSyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClubSyncApplication.class, args);
    }

}
