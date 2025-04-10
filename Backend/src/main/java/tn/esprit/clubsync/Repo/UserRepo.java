package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.clubsync.entities.Club;
import tn.esprit.clubsync.entities.Users;

import java.util.List;

public interface UserRepo extends JpaRepository<Users, Long> {

}
