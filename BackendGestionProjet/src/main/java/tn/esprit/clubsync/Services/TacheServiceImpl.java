package tn.esprit.clubsync.Services;

import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.TacheRepository;
import tn.esprit.clubsync.entities.ProjetTache;

import java.io.IOException;
import java.util.List;

@Service
public class TacheServiceImpl  implements iTacheService {

    private final TacheRepository tacheRepository;

    // Constructor injection is recommended
    public TacheServiceImpl(TacheRepository tacheRepository) {
        this.tacheRepository = tacheRepository;
    }

    @Override
    public ProjetTache saveProjetTache(ProjetTache ProjetTache) throws IOException {
        // Add any business logic/validation before saving
        return tacheRepository.save(ProjetTache);
    }

    @Override
    public ProjetTache updateProjetTache(ProjetTache ProjetTache, Long id) {
        // Check if ProjetTache exists
        ProjetTache existingProjetTache = tacheRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProjetTache not found with id: " + id));

        // Update fields - adjust according to your entity structure
        existingProjetTache.setTitre(ProjetTache.getTitre());
        existingProjetTache.setDescription(ProjetTache.getDescription());
        existingProjetTache.setDateCreated(ProjetTache.getDateCreated());
        existingProjetTache.setLastUpdated(ProjetTache.getLastUpdated());
        existingProjetTache.setStatus(ProjetTache.getStatus());
        existingProjetTache.setPriorite(ProjetTache.getPriorite());
        existingProjetTache.setDueDate(ProjetTache.getDueDate());
        existingProjetTache.setProgress(ProjetTache.getProgress());
        existingProjetTache.setLabel(ProjetTache.getLabel());
        existingProjetTache.setCompletedDate(ProjetTache.getCompletedDate());
        existingProjetTache.setcProjetId(ProjetTache.getProjetId());
        existingProjetTache.setAssigneeId(ProjetTache.getAssigneeId());


        return tacheRepository.save(existingProjetTache);
    }

    @Override
    public void deleteProjetTache(ProjetTache ProjetTache) {
        tacheRepository.delete(ProjetTache);
    }

    @Override
    public void deleteProjetTacheById(Long id) {
        tacheRepository.deleteById(id);
    }

    @Override
    public List<ProjetTache> findProjetTaches() {

        return tacheRepository.findAll();


    }

    @Override
    public ProjetTache findById(Long id) {
        return tacheRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProjetTache not found with id: " + id));
    }

    @Override
    public List<ProjetTache> searchTacheByTitle( String title) {
        return tacheRepository.searchTacheByTitle(title);
    }
    @Override
    public List<ProjetTache> searchTacheByIdProjet( Long IdProjet) {
        return tacheRepository.searchTacheByIdProjet(IdProjet);
    }

    @Override
    public List<ProjetTache> searchTacheByStatus( Long IdProjet, String status) {
        return tacheRepository.searchTacheByStatus(IdProjet, status);
    }

}
