package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.clubsync.entities.Club;

import java.util.List;

public interface ClubRepo extends JpaRepository<Club, Long> {
}