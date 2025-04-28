package tn.esprit.clubsync.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.ReclamationRepository;
import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.dtos.ReclamationRequest;
import tn.esprit.clubsync.dtos.ReclamationResponse;
import tn.esprit.clubsync.dtos.ReclamationResponseDTO;
import tn.esprit.clubsync.entities.Reclamation;
import tn.esprit.clubsync.entities.User;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ReclamationServiceImpl implements IReclamationService {

    @Autowired
    private BadWordFilterService badWordFilterService;
    @Autowired private ReclamationRepository reclamationRepository;
    @Autowired private UserRepository userRepository;

    @Override
    public Reclamation createReclamation(User nuser, ReclamationRequest dto) {
        if (badWordFilterService.containsBadWords(dto.getDescription())) {
            throw new RuntimeException("❌ La description contient un langage inapproprié.");
        }
        System.out.println("📌 User ID passed: " + nuser.getIdUser());

        User managedUser = userRepository.findById(nuser.getIdUser())
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("✅ Managed User: " + managedUser.getEmail());

        Reclamation reclamation = new Reclamation();
        reclamation.setNuser(managedUser);
        reclamation.setDateReclamation(dto.getDateReclamation()); // ✔ Utiliser la date du DTO
        reclamation.setTypeReclamation(dto.getTypeReclamation());
        reclamation.setDescription(dto.getDescription());
        reclamation.setStatut(dto.getStatut()); // ✔ utiliser le statut du DTO (pas toujours IN_PROGRESS sinon bug logique)
        reclamation.setDateResolution(dto.getDateResolution()); // ✔ ajouter dateResolution
        reclamation.setArchived(false);

        return reclamationRepository.save(reclamation);
    }


    @Override
    public Reclamation addReclamation(ReclamationRequest dto) {

        if (badWordFilterService.containsBadWords(dto.getDescription())) {
            throw new RuntimeException("La description contient des mots interdits.");
        }

        Reclamation r = new Reclamation();
        r.setTypeReclamation(dto.getTypeReclamation());
        r.setDescription(dto.getDescription());
        r.setDateReclamation(new Date());
        r.setStatut(Reclamation.StatutReclamation.IN_PROGRESS);
        r.setArchived(false);

        return reclamationRepository.save(r);
    }


    @Override
    public Reclamation updateReclamationByAdmin(Integer id, ReclamationRequest dto, User admin) {
        return reclamationRepository.findById(id)
                .map(existing -> {
                    if (dto.getStatut() != null) {
                        existing.setStatut(dto.getStatut());
                    }
                    if (dto.getDateResolution() != null) {
                        existing.setDateResolution(dto.getDateResolution());
                    }
                    existing.setAdmin(admin);
                    return reclamationRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Réclamation introuvable avec l'ID : " + id));
    }


    @Override
    public List<Reclamation> getAllReclamations() {
        return reclamationRepository.findByArchivedFalse();
    }

    @Override
    public Optional<Reclamation> getReclamationById(Integer id) {
        return reclamationRepository.findById(id);
    }

    @Override
    public void deleteReclamation(Integer id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamation not found with ID: " + id));
        reclamation.setArchived(true);
        reclamationRepository.save(reclamation);
    }

    @Override
    public List<Reclamation> getArchivedReclamations() {
        return reclamationRepository.findByArchivedTrue();
    }

    @Override
    public Reclamation restoreReclamation(Integer id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamation not found with ID: " + id));
        reclamation.setArchived(false);
        return reclamationRepository.save(reclamation);
    }

    @Override
    public List<ReclamationResponseDTO> getAllReclamationsDTO(boolean includeArchivedOrUnverified) {
        List<Reclamation> all = includeArchivedOrUnverified
                ? reclamationRepository.findAll()
                : reclamationRepository.findByArchivedFalse();
        System.out.println("✔️ Reclamations chargées : " + all.size());

        return all.stream()
                .filter(r -> r.getNuser() != null)
                .filter(r -> includeArchivedOrUnverified || (r.getNuser().isEnabled() && !r.getNuser().isArchived()))
                .map(r -> {
                    User user = r.getNuser();
                    return ReclamationResponseDTO.builder()
                            .id(r.getIdReclamation())
                            .nomUtilisateur(user.getLastname() + " " + user.getFirstname())
                            .typeReclamation(r.getTypeReclamation().name())
                            .description(r.getDescription())
                            .statut(r.getStatut().name())
                            .dateReclamation(r.getDateReclamation())
                            .build();
                }).toList();
    }

    private ReclamationResponse mapToReclamationResponse(Reclamation r) {
        ReclamationResponse dto = new ReclamationResponse();
        dto.setId(Long.valueOf(r.getIdReclamation()));
        dto.setType(r.getTypeReclamation().name());
        dto.setDescription(r.getDescription());
        dto.setStatut(r.getStatut().name());
        dto.setDateReclamation(r.getDateReclamation());
        dto.setDateResolution(r.getDateResolution());
        dto.setNomNuser((r.getNuser() != null ? r.getNuser().getUsername() : null));
        dto.setNomAdmin(r.getAdmin() != null ? r.getAdmin().getUsername() : null);
        return dto;
    }

    @Override
    public List<ReclamationResponse> getMesReclamationsResponse(User user) {
        return reclamationRepository.findBynuser_IdUser(user.getIdUser())
                .stream()
                .map(this::mapToReclamationResponse)
                .toList();
    }
}
