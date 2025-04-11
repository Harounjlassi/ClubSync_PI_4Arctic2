package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.entities.Projet;
import tn.esprit.clubsync.entities.ProjetTache;
import tn.esprit.clubsync.entities.Users;

import java.util.List;

@Service
public interface UserRepo extends JpaRepository<Users, Long> {
    @Query("SELECT t FROM Users t WHERE t.username LIKE %:username%")
    List<Users> searchUserByUsername(@Param("username") String username);

    @Query("SELECT u FROM Users u WHERE u.id = :id")
    List<Users> findUserById(@Param("id") Long id);
}
