package tn.esprit.clubsync.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.CommentRepo;
import tn.esprit.clubsync.Repo.ReplyRepo;
import tn.esprit.clubsync.Repo.UserRepo;
import tn.esprit.clubsync.entities.Comment;
import tn.esprit.clubsync.entities.Reply;
import tn.esprit.clubsync.entities.Users;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReplyServiceImpl implements iReplyService {

    @Autowired
    private ReplyRepo replyRepository;

    @Autowired
    private CommentRepo commentRepository;  //

    @Autowired
    private UserRepo userRepository;

    @Override
    public Reply addReply(Reply reply) {
        // Vérifie et récupère le commentaire lié
        Comment comment = commentRepository.findById(reply.getComment().getId_comment())
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Vérifie et récupère l'utilisateur auteur
        Users author = userRepository.findById(reply.getAuthor().getId())
                .orElseThrow(() -> new RuntimeException("Author not found"));

        // Met à jour la date du reply
        reply.setReply_date(LocalDateTime.now());

        // Associe les vraies entités au reply
        reply.setComment(comment);
        reply.setAuthor(author);

        return replyRepository.save(reply);
    }


    @Override
    public Reply updateReply(Reply reply) {
        return replyRepository.save(reply);
    }

    @Override
    public void deleteReply(Long id) {
        replyRepository.deleteById(id);
    }

    @Override
    public Reply getReplyById(Long id) {
        return replyRepository.findById(id).orElse(null);
    }

    @Override
    public List<Reply> getRepliesByComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId).orElse(null);
        return comment != null ? replyRepository.findByComment(comment) : List.of();

    }

    @Override
    public List<Reply> getRepliesByAuthor(Long authorId) {
        Users author = userRepository.findById(authorId).orElse(null);
        return author != null ? replyRepository.findByAuthor(author) : List.of();
    }

}