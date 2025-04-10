package tn.esprit.clubsync.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.CommentRepo;
import tn.esprit.clubsync.Repo.ForumPostRepo;
import tn.esprit.clubsync.Repo.UserRepo;
import tn.esprit.clubsync.entities.Comment;
import tn.esprit.clubsync.entities.ForumPost;

import java.util.List;


@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements iCommentService {

    @Autowired
    private CommentRepo commentRepository;
    @Autowired
    private ForumPostRepo forumPostRepository;

    @Override
    public Comment addComment(Comment comment) {
        return commentRepository.save(comment);
    }

    @Override
    public Comment updateComment(Comment comment) {
        return commentRepository.save(comment);
    }

    @Override
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    @Override
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id).orElse(null);
    }

    @Override
    public List<Comment> getCommentsByForumPost(Long postId) {
        ForumPost post = forumPostRepository.findById(postId).orElse(null);
        if (post != null) {
            return commentRepository.findByForumPost(post);
        }
        return List.of();
    }

}
