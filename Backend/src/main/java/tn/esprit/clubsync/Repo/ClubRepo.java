package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.clubsync.entities.Club;

import java.util.List;
import java.util.Optional;

public interface ClubRepo extends JpaRepository<Club, Long> {
    @Query("SELECT c FROM Club c WHERE lower(c.name) LIKE lower(concat('%', :name, '%'))")
    Optional<Club> findByNameContainingIgnoreCase(@Param("name") String name);

    List<Club> findByCategorieIgnoreCase(String categorie);

}