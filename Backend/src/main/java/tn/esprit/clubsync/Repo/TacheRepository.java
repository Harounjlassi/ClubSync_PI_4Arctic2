package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.clubsync.entities.ProjetTache;

import java.time.LocalDate;
import java.util.List;

@Repository

public interface  TacheRepository extends JpaRepository<ProjetTache, Long> {

    List<ProjetTache> findByTitreContainingIgnoreCase(String title);

    List<ProjetTache> findBydateCreatedBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT r FROM ProjetTache r WHERE r.description LIKE %:keyword%")
    List<ProjetTache> searchByDescription(@Param("keyword") String keyword);

    @Query(value = "SELECT * FROM ProjetTache WHERE status = :status", nativeQuery = true)
    List<ProjetTache> findByStatus(@Param("status") String status);

    @Query("SELECT t FROM ProjetTache t WHERE t.titre LIKE %:titre%")
    List<ProjetTache> searchTacheByTitle(@Param("titre") String titre);

    @Query("SELECT t FROM ProjetTache t WHERE t.projet.id = :projetId")
    List<ProjetTache> searchTacheByIdProjet(@Param("projetId") Long projetId);

    @Query("SELECT t FROM ProjetTache t WHERE  t.projet.id = :projetId AND t.status = :status")
    List<ProjetTache> searchTacheByStatus(@Param("projetId") Long projetId , @Param("status") String status);
}
