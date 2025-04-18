package tn.esprit.clubsync.Controller;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Repo.AnnouncementRepo;
import tn.esprit.clubsync.Services.iClubService;
import tn.esprit.clubsync.entities.Announcement;
import tn.esprit.clubsync.Services.AnnouncementService;

import java.util.List;
import java.util.Scanner;
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


    @PostMapping("/add/{clubId}")
    public Announcement addAnnouncement(@RequestBody Announcement announcement, @PathVariable Long clubId) {
        return announcementService.addAnnouncement(announcement, clubId);
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
    public List<Announcement> getAll() {
        return announcementRepo.findAll().stream()
                .peek(a -> Hibernate.initialize(a.getClub())) // Force le chargement
                .collect(Collectors.toList());
    }
    @PutMapping("/update/{id}")
    public Announcement updateAnnouncement(@PathVariable Long id, @RequestBody Announcement announcement) {
        System.out.println("Received update request for announcement ID: " + id);
        System.out.println("Club ID in request: " + (announcement.getClub() != null ?
                announcement.getClub().getId_club() : "null"));
        return announcementService.updateAnnouncement(id, announcement);
    }


}