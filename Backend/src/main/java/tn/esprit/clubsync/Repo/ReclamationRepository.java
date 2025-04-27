package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.clubsync.entities.Reclamation;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Integer> {
    List<Reclamation> findByArchivedFalse();
    List<Reclamation> findByArchivedTrue();
    List<Reclamation> findBynuser_IdUser(Long id);

}