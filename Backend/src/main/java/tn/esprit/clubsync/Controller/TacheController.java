package tn.esprit.clubsync.Controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Repo.TacheRepository;
import tn.esprit.clubsync.Services.ReportServiceImpl;
import tn.esprit.clubsync.Services.TacheServiceImpl;
import tn.esprit.clubsync.entities.ProjetTache;
import tn.esprit.clubsync.entities.Report;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("taches")
@CrossOrigin(origins = "http://localhost:4200")
public class TacheController {


    private final TacheServiceImpl tacheService;

    public TacheController(TacheServiceImpl tacheService) {
        this.tacheService = tacheService;
    }

    @GetMapping("/all")
    public List<ProjetTache> getAllTaches() {
        return tacheService.findProjetTaches();
    }

    @PostMapping("/add")
    public ResponseEntity<ProjetTache> addTache(@RequestBody ProjetTache projetTache) throws IOException {
        ProjetTache savedTache = tacheService.saveProjetTache(projetTache);
        return ResponseEntity.ok(savedTache);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ProjetTache> updateTache(@PathVariable Long id, @RequestBody ProjetTache projetTache) {
        projetTache.setId(id);
        ProjetTache updatedTache = tacheService.updateProjetTache(projetTache, id);
        return ResponseEntity.ok(updatedTache);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTache(@PathVariable Long id) {
        tacheService.deleteProjetTacheById(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/findByTacheByTitre/{titre}")
    public ResponseEntity<List<ProjetTache>> searchTacheByTitre(@PathVariable String titre) {
        List<ProjetTache> existingTaches = tacheService.searchTacheByTitle(titre);
        return ResponseEntity.ok(existingTaches);
    }
    @GetMapping("/findByTacheByIdProjet/{IdProjet}")
    public ResponseEntity<List<ProjetTache>> searchTacheByIdProjet(@PathVariable Long IdProjet) {
        List<ProjetTache> existingTaches = tacheService.searchTacheByIdProjet(IdProjet);
        return ResponseEntity.ok(existingTaches);
    }

    @GetMapping("/findByTacheByStatus/{IdProjet}/status/{status}")
    public ResponseEntity<List<ProjetTache>> searchTacheByStatus(@PathVariable Long IdProjet, @PathVariable String status) {
        List<ProjetTache> existingTaches = tacheService.searchTacheByStatus(IdProjet, status);
        return ResponseEntity.ok(existingTaches);
    }

}
