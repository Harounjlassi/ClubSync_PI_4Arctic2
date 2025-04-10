package tn.esprit.clubsync.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.ReplyRepo;
import tn.esprit.clubsync.entities.Reply;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReplyServiceImpl implements iReplyService {

    @Autowired
    private ReplyRepo replyRepository;

    public Reply addReply(Reply reply) {
        return replyRepository.save(reply);
    }

    @Override
    public Reply updateReply(Reply reply) {
        return null;
    }

    @Override
    public void deleteReply(Long id) {

    }

    @Override
    public Reply getReplyById(Long id) {
        return null;
    }

    @Override
    public List<Reply> getRepliesByComment(Long commentId) {
        return null;
    }

    @Override
    public List<Reply> getRepliesByAuthor(Long authorId) {
        return null;
    }

}