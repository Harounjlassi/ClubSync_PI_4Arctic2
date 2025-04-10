package tn.esprit.clubsync.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.ForumPostRepo;
import tn.esprit.clubsync.Repo.ReactRepo;
import tn.esprit.clubsync.Repo.UserRepo;
import tn.esprit.clubsync.entities.ForumPost;
import tn.esprit.clubsync.entities.React;
import tn.esprit.clubsync.entities.Users;

import java.util.List;


@Service
@RequiredArgsConstructor
public class ReactServiceImpl implements IReactService {

    @Autowired
    private ReactRepo reactRepo;
    @Autowired
    private ForumPostRepo forumPostRepo;
    @Autowired
    private UserRepo userRepo;

    @Override
    public React addReact(React react) {
        return reactRepo.save(react);
    }

    @Override
    public void removeReact(Long id) {
        reactRepo.deleteById(id);
    }

    @Override
    public React getReactById(Long id) {
        return reactRepo.findById(id).orElse(null);
    }

    @Override
    public List<React> getReactsByForumPost(Long postId) {
        ForumPost post = forumPostRepo.findById(postId).orElse(null);
        if (post != null) {
            return reactRepo.findByForumPost(post);
        }
        return List.of();
    }

    @Override
    public List<React> getReactsByAuthor(Long authorId) {
        Users author = userRepo.findById(authorId).orElse(null);
        if (author != null) {
            return reactRepo.findByAuthor(author);
        }
        return List.of();
    }

    @Override
    public long countReactsByPostAndType(Long postId, React.ReactType type) {
        ForumPost post = forumPostRepo.findById(postId).orElse(null);
        if (post != null) {
            return reactRepo.countByForumPostAndType(post, type);
        }
        return 0;
    }


    @Override
    public React updateReact(React react) {
        return reactRepo.save(react);
    }
}
