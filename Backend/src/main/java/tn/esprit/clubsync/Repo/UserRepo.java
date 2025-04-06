package tn.esprit.clubsync.Repo;
import org.springframework.data.jpa.repository.JpaRepository;

import tn.esprit.clubsync.entities.Users;

import java.util.Optional;


public interface UserRepo extends   JpaRepository<Users, Integer>  {

    Optional<Users> findByUsername(String username);
}
