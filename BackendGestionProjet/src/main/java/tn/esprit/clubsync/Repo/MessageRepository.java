package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.clubsync.entities.Message;
import tn.esprit.clubsync.entities.ProjetTache;


import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT t FROM Message t WHERE t.projet.id = :projetId")
    List<Message> searchMessageByIdProjet(@Param("projetId") Long projetId);


}
