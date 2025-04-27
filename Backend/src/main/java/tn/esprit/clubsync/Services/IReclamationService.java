package tn.esprit.clubsync.Services;


import tn.esprit.clubsync.dtos.ReclamationRequest;
import tn.esprit.clubsync.dtos.ReclamationResponse;
import tn.esprit.clubsync.dtos.ReclamationResponseDTO;
import tn.esprit.clubsync.entities.Reclamation;
import tn.esprit.clubsync.entities.User;

import java.util.List;
import java.util.Optional;

public interface IReclamationService {
    Reclamation addReclamation(ReclamationRequest reclamation);
    List<Reclamation> getAllReclamations();
    Optional<Reclamation> getReclamationById(Integer id);
    void deleteReclamation(Integer id);
    List<Reclamation> getArchivedReclamations();
    Reclamation restoreReclamation(Integer id);
    Reclamation updateReclamationByAdmin(Integer id, ReclamationRequest dto, User admin);    List<ReclamationResponseDTO> getAllReclamationsDTO(boolean includeArchivedOrUnverified);
    List<ReclamationResponse> getMesReclamationsResponse(User user);

    Reclamation createReclamation(User etudiant, ReclamationRequest dto);
}