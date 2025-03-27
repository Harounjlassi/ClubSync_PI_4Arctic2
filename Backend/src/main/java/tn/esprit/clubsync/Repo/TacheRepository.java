package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.clubsync.entities.ProjetTache;

public interface TacheRepository extends JpaRepository<ProjetTache, Long> {
}
