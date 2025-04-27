package tn.esprit.clubsync.Services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Services.AnnouncementService;
import tn.esprit.clubsync.entities.Announcement;
import tn.esprit.clubsync.entities.Club;
import tn.esprit.clubsync.Repo.AnnouncementRepo;
import tn.esprit.clubsync.Repo.ClubRepo;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional

public class AnnouncementServiceImpl implements AnnouncementService {

    @Autowired
    private ClubRepo clubRepo;

    @Autowired
    AnnouncementRepo announcementRepo;


    @Override
    public Announcement addAnnouncement(Announcement announcement, Long clubId) {
        Club club = clubRepo.findById(clubId).orElseThrow(() -> new RuntimeException("Club not found"));
        announcement.setClub(club);
        return announcementRepo.save(announcement);
    }

    @Override
    public List<Announcement> getAnnouncementsByClub(Long clubId) {
        return announcementRepo.findAll().stream()
                .filter(a -> a.getClub().getId_club().equals(clubId))
                .toList();
    }

    @Override
    public Announcement getAnnouncement(Long id) {
        return announcementRepo.findById(id).orElseThrow(() -> new RuntimeException("Announcement not found"));
    }

    @Override
    public void deleteAnnouncement(Long id) {
        announcementRepo.deleteById(id);
    }

    @Override
    public List<Announcement> getAllAnnouncements() {
        System.out.println("Récupération de toutes les annonces...");
        List<Announcement> announcements = announcementRepo.findAll();
        System.out.println("Nombre d'annonces récupérées: " + announcements.size());

        // Vérifier chaque annonce
        for (int i = 0; i < announcements.size(); i++) {
            Announcement announcement = announcements.get(i);
            System.out.println("Annonce " + (i+1) + " (ID: " + announcement.getId() + "):");
            System.out.println("  - Titre: " + announcement.getTitle());
            System.out.println("  - Club: " + (announcement.getClub() != null ?
                    announcement.getClub().getName() + " (ID: " +
                            announcement.getClub().getId_club() + ")" : "null"));
        }

        return announcements;
    }    @Override
    public Announcement updateAnnouncement(Long id, Announcement newAnnouncement) {
        return announcementRepo.findById(id).map(existing -> {
            existing.setTitle(newAnnouncement.getTitle());
            existing.setContent(newAnnouncement.getContent());

            // Also update the club if provided
            if (newAnnouncement.getClub() != null && newAnnouncement.getClub().getId_club() != null) {
                Club club = clubRepo.findById(newAnnouncement.getClub().getId_club())
                        .orElseThrow(() -> new RuntimeException("Club not found with ID: " +
                                newAnnouncement.getClub().getId_club()));
                existing.setClub(club);
            }

            return announcementRepo.save(existing);
        }).orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + id));
    }

}
