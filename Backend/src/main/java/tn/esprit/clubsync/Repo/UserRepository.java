package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    @Query("SELECT t FROM User t WHERE t.lastname LIKE %:username%")
    List<User> searchUserByUsername(@Param("username") String username);

    @Query("SELECT u FROM User u WHERE u.idUser = :id")
    List<User> findUserById(@Param("id") Long id);
}