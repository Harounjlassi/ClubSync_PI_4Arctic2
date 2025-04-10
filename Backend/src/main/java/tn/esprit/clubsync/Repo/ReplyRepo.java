package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.clubsync.entities.Comment;
import tn.esprit.clubsync.entities.Reply;
import tn.esprit.clubsync.entities.Users;

import java.util.List;


@Repository
public interface ReplyRepo extends JpaRepository<Reply, Long> {
    List<Reply> findByComment(Comment comment);

    List<Reply> findByAuthor(Users author);
}
