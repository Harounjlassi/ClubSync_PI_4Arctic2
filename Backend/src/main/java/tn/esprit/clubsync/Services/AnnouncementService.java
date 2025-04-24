package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.Announcement;

import java.util.List;

public interface AnnouncementService {
    public Announcement addAnnouncement(Announcement announcement, Long clubId);
    public List<Announcement> getAnnouncementsByClub(Long clubId);
    public Announcement getAnnouncement(Long id);
    public void deleteAnnouncement(Long id);
    public List<Announcement> getAllAnnouncements();
    public Announcement updateAnnouncement(Long id, Announcement announcement);


}