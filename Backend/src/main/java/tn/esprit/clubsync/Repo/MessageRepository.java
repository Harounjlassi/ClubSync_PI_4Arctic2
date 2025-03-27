package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.clubsync.entities.Message;
import tn.esprit.clubsync.entities.Projet;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
