package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.clubsync.entities.ForumPost;

@Repository
public interface ForumPostRepo extends JpaRepository<ForumPost, Long> {
}