package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.clubsync.entities.Report;

public interface ReportRepository extends JpaRepository<Report, Long> {
}
