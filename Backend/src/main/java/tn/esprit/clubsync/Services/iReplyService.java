package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.Reply;

import java.util.List;

public interface iReplyService {

    Reply addReply(Reply reply);
    Reply updateReply(Reply reply);
    void deleteReply(Long id);
    Reply getReplyById(Long id);
    List<Reply> getRepliesByComment(Long commentId);
    List<Reply> getRepliesByAuthor(Long authorId);
}
