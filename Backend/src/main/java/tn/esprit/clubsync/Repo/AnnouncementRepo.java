package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.clubsync.entities.Announcement;

public interface AnnouncementRepo extends JpaRepository<Announcement, Long> {
}
