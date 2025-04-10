package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.Comment;

import java.util.List;

public interface iCommentService {
    Comment addComment(Comment comment);
    Comment updateComment(Comment comment);
    void deleteComment(Long id);
    Comment getCommentById(Long id);
    List<Comment> getCommentsByForumPost(Long postId);
}
