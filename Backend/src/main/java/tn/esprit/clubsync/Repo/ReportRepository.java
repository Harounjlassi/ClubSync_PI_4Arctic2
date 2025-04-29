package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.clubsync.entities.Report;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByTitleContainingIgnoreCase(String title);

    List<Report> findBydateCreatedBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT r FROM Report r WHERE r.description LIKE %:keyword%")
    List<Report> searchByDescription(@Param("keyword") String keyword);

    @Query(value = "SELECT * FROM Reports WHERE status = :status", nativeQuery = true)
    List<Report> findByStatus(@Param("status") String status);

    @Query("SELECT r.title FROM Report r WHERE r.id = :id")
    Optional<String> findTitleById(@Param("id") Long id);

    @Query("SELECT r, t.titre as taskName FROM Report r JOIN r.tache t WHERE r.projet.id = :projetId")
    List<Report> findReportsByProjetId(@Param("projetId") Long projetId);}