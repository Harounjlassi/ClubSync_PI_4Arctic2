package tn.esprit.clubsync.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.ProjetServiceImpl;
import tn.esprit.clubsync.Services.iProjetService;
import tn.esprit.clubsync.entities.Projet;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/projets")
@CrossOrigin(origins = "http://localhost:4200")
public class ProjetController {

    private final ProjetServiceImpl projetService;

    public ProjetController(ProjetServiceImpl projetService) {
        this.projetService = projetService;
    }

    @PostMapping("/add")
    public ResponseEntity<Projet> createProjet(@RequestBody Projet projet) {
        try {
            if (projet.getImageUrl() != null && !projet.getImageUrl().isEmpty()) {
                if (!isValidBase64Image(projet.getImageUrl())) {
                    return ResponseEntity.badRequest().build();
                }
            }
            Projet savedProjet = projetService.saveProjet(projet);
            return new ResponseEntity<>(savedProjet, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    private boolean isValidBase64Image(String imageStr) {
        try {
            // Check if it's a data URL
            if (imageStr.startsWith("data:image")) {
                String base64Image = imageStr.split(",")[1];
                Base64.getDecoder().decode(base64Image);
                return true;
            }
            // Or if it's just Base64 without prefix
            Base64.getDecoder().decode(imageStr);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Projet> updateProjet(@PathVariable Long id, @RequestBody Projet projet) {
        try {
            if (projet.getImageUrl() != null && !projet.getImageUrl().isEmpty()) {
                if (!isValidBase64Image(projet.getImageUrl())) {
                    return ResponseEntity.badRequest().build();
                }
            }
            Projet updatedProjet = projetService.updateProjet(projet, id);
            return new ResponseEntity<>(updatedProjet, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<HttpStatus> deleteProjet(@PathVariable Long id) {

        try {
            projetService.deleteProjetById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/simple")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Works");
    }
    @GetMapping("/all")
    public ResponseEntity<List<Projet>> getAllProjets() {
        // Create a defensive copy to prevent modification during serialization
        List<Projet> projets = new ArrayList<>(projetService.findProjets());
        //log the rersponse?
        System.out.println("Response: " + projets);

        return ResponseEntity.ok(projets);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Projet> getProjetById(@PathVariable Long id) {
        try {
            Projet projet = projetService.findById(id);
            return new ResponseEntity<>(projet, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
}