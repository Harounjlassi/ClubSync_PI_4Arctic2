package tn.esprit.clubsync.Services;

import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.ForumPostRepo;
import tn.esprit.clubsync.Repo.UserRepo;
import tn.esprit.clubsync.entities.ForumPost;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ForumPostServiceImpl implements iForumPostService {

    @Autowired
    private ForumPostRepo forumPostRepository;
    @Autowired
    private UserRepo userRepository;


    @Override
    public ForumPost addForumPost(ForumPost forumPost) {
        return forumPostRepository.save(forumPost);
    }

    @Override
    public ForumPost updateForumPost(ForumPost forumPost) {
        return forumPostRepository.save(forumPost);
    }

    @Override
    public void deleteForumPost(Long id) {
        forumPostRepository.deleteById(id);
    }

    @Override
    public ForumPost getForumPostById(Long id) {
        return forumPostRepository.findById(id).orElse(null);
    }

    @Override
    public List<ForumPost> getAllForumPosts() {
        return forumPostRepository.findAll();
    }

}
