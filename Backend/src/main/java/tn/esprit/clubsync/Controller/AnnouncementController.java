package tn.esprit.clubsync.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.clubsync.Repo.AnnouncementRepo;
import tn.esprit.clubsync.Repo.ClubRepo;
import tn.esprit.clubsync.Services.iClubService;
import tn.esprit.clubsync.entities.Announcement;
import tn.esprit.clubsync.Services.AnnouncementService;
import tn.esprit.clubsync.entities.Club;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200") // Permet à Angular d'accéder au backend

public class AnnouncementController {

    @Autowired
    AnnouncementService announcementService;

    @Autowired
    AnnouncementRepo announcementRepo;

    @Autowired
    ClubRepo clubRepo;


    @PostMapping("/add/{clubId}")
    public ResponseEntity<?> addAnnouncement(
            @RequestBody @Valid Announcement announcement,
            @PathVariable Long clubId,
            BindingResult result) {

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body("Champs invalides");
        }

        Club club = clubRepo.findById(clubId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable"));

        if (announcement.getTitle().trim().isEmpty() || announcement.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Titre et contenu requis");
        }

        announcement.setClub(club);
        Announcement savedAnnouncement = announcementRepo.save(announcement);

        return ResponseEntity.ok(savedAnnouncement);
    }

    @GetMapping("/club/{clubId}")
    public List<Announcement> getClubAnnouncements(@PathVariable Long clubId) {
        return announcementService.getAnnouncementsByClub(clubId);
    }

    @GetMapping("/{id}")
    public Announcement getAnnouncement(@PathVariable Long id) {
        return announcementService.getAnnouncement(id);
    }

    @DeleteMapping("/{id}")
    public void deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
    }

    @GetMapping("/all")
    public List<Map<String, Object>> getAllStandardized() {
        List<Announcement> announcements = announcementRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Announcement announcement : announcements) {
            Map<String, Object> announcementMap = new HashMap<>();
            announcementMap.put("id", announcement.getId());
            announcementMap.put("title", announcement.getTitle());
            announcementMap.put("content", announcement.getContent());
            announcementMap.put("createdAt", announcement.getCreatedAt());

            // Standardiser la façon dont le club est renvoyé
            if (announcement.getClub() != null) {
                Club club = announcement.getClub();
                Map<String, Object> clubMap = new HashMap<>();
                clubMap.put("id_club", club.getId_club());
                clubMap.put("name", club.getName());
                clubMap.put("description", club.getDescription());
                // Ajouter d'autres propriétés essentielles du club

                announcementMap.put("club", clubMap);
            }

            result.add(announcementMap);
        }

        return result;
    }
    @PutMapping("/update/{id}")
    public Announcement updateAnnouncement(@PathVariable Long id, @RequestBody Announcement announcement) {
        System.out.println("Received update request for announcement ID: " + id);
        System.out.println("Club ID in request: " + (announcement.getClub() != null ?
                announcement.getClub().getId_club() : "null"));
        return announcementService.updateAnnouncement(id, announcement);
    }


}