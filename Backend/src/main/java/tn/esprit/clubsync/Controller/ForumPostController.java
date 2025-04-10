package tn.esprit.clubsync.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.entities.ForumPost;
import tn.esprit.clubsync.Services.iForumPostService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/forum-posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ForumPostController {

    @Autowired
    private iForumPostService forumPostService;
    @PostMapping
    public ResponseEntity<ForumPost> createForumPost(@RequestBody ForumPost forumPost) {
        return ResponseEntity.ok(forumPostService.addForumPost(forumPost));
    }

    @PutMapping
    public ResponseEntity<ForumPost> updateForumPost(@RequestBody ForumPost forumPost) {
        ForumPost updated = forumPostService.updateForumPost(forumPost);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForumPost(@PathVariable Long id) {
        forumPostService.deleteForumPost(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ForumPost> getForumPostById(@PathVariable Long id) {
        ForumPost forumPost = forumPostService.getForumPostById(id);
        return forumPost != null ? ResponseEntity.ok(forumPost) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<ForumPost>> getAllForumPosts() {
        return ResponseEntity.ok(forumPostService.getAllForumPosts());
    }

}
