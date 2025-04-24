package tn.esprit.clubsync.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.ProjetRepository;
import tn.esprit.clubsync.entities.Projet;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjetServiceImpl implements iProjetService {

    private final ProjetRepository projetRepository;

    // Constructor injection is recommended
    public ProjetServiceImpl(ProjetRepository projetRepository) {
        this.projetRepository = projetRepository;
    }

    @Override
    public Projet saveProjet(Projet projet) throws IOException {
        // Add any business logic/validation before saving
        return projetRepository.save(projet);
    }

    @Override
    public Projet updateProjet(Projet projet, Long id) {
        // Check if projet exists
        Projet existingProjet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet not found with id: " + id));

        // Update fields - adjust according to your entity structure
        existingProjet.setNom(projet.getNom());
        existingProjet.setDescription(projet.getDescription());
        existingProjet.setDateCreated(projet.getDateCreated());
        existingProjet.setLastUpdated(projet.getLastUpdated());
        existingProjet.setImageUrl(projet.getImageUrl());
        existingProjet.setStatus(projet.getStatus());
        existingProjet.setcreateurId(projet.getCreateurId());
        existingProjet.setProgress(projet.getProgress());

        // ... update other fields as needed

        return projetRepository.save(existingProjet);
    }

    @Override
    public void deleteProjet(Projet projet) {
        projetRepository.delete(projet);
    }

    @Override
    public void deleteProjetById(Long id) {
        projetRepository.deleteById(id);
    }

    @Override
    public List<Projet> findProjets() {

        return projetRepository.findAll();


    }

    @Override
    public Projet findById(Long id) {
        return projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet not found with id: " + id));
    }
}