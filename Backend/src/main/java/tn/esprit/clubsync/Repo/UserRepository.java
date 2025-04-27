package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.clubsync.entities.Sexe;
import tn.esprit.clubsync.entities.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByIdUserAndArchivedFalse(Long idUser);
    List<User> findAllByArchivedFalse();
    List<User> findByLastnameContainingIgnoreCase(String lastname);
    List<User> findByFirstnameContainingIgnoreCase(String firstname);
    List<User> findByEmailContainingIgnoreCase(String email);
    List<User> findBySexe(Sexe sexe);
    List<User> findByArchived(Boolean archived);
    boolean existsByEmail(String email);
}