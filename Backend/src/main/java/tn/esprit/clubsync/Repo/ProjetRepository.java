package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import tn.esprit.clubsync.entities.Projet;

@RepositoryRestResource(collectionResourceRel = "Projet",path = "projet")
public interface ProjetRepository  extends JpaRepository<Projet, Long> {
}
