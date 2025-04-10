package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.ForumPost;

import java.util.List;

public interface iForumPostService {
    ForumPost addForumPost(ForumPost forumPost);
    ForumPost updateForumPost(ForumPost forumPost);
    void deleteForumPost(Long id);
    ForumPost getForumPostById(Long id);
    List<ForumPost> getAllForumPosts();
}