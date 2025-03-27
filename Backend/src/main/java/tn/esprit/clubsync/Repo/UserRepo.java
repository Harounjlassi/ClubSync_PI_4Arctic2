package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import tn.esprit.clubsync.entities.Projet;
import tn.esprit.clubsync.entities.Users;

@RepositoryRestResource(collectionResourceRel = "Users",path = "users")
public interface UserRepo extends JpaRepository<Users, Long> {
}
