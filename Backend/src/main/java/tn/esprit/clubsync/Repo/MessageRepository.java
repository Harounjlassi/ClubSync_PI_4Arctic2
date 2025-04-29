package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.clubsync.entities.Message;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT t FROM Message t WHERE t.projet.id = :projetId")
    List<Message> searchMessageByIdProjet(@Param("projetId") Long projetId);


}
