package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.clubsync.entities.ForumPost;
import tn.esprit.clubsync.entities.React;
import tn.esprit.clubsync.entities.Reply;
import tn.esprit.clubsync.entities.Users;

import java.util.List;


@Repository
public interface ReactRepo extends JpaRepository<React, Long> {
    List<React> findByAuthorAndForumPost(Users author, ForumPost forumPost);

    List<React> findByForumPost(ForumPost post);

    List<React> findByAuthor(Users author);

    long countByForumPostAndType(ForumPost post, React.ReactType type);
}
