package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.clubsync.entities.Projet;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, Long> {

    // Custom query using method naming convention
    List<Projet> findByNomContainingIgnoreCase(String nom);

    // Custom query for projets within a date range
    List<Projet> findBydateCreatedBetween(LocalDate startDate, LocalDate endDate);

    // JPQL custom query
    @Query("SELECT p FROM Projet p WHERE p.description LIKE %:keyword%")
    List<Projet> searchByDescription(@Param("keyword") String keyword);

    // Native SQL query
    @Query(value = "SELECT * FROM projets WHERE status = :status", nativeQuery = true)
    List<Projet> findByStatus(@Param("status") String status);

    // Projection query
    @Query("SELECT p.nom FROM Projet p WHERE p.id = :id")
    Optional<String> findNomById(@Param("id") Long id);
}