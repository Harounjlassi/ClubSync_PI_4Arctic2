package tn.esprit.clubsync.Controller;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.entities.Reply;
import tn.esprit.clubsync.Services.iReplyService;

import java.util.List;

@RestController
@RequestMapping("/api/replies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ReplyController {

    @Autowired
    private iReplyService replyService;

    @PostMapping
    public ResponseEntity<Reply> createReply(@RequestBody Reply reply) {
        return ResponseEntity.ok(replyService.addReply(reply));
    }

    @PutMapping
    public ResponseEntity<Reply> updateReply(@RequestBody Reply reply) {
        Reply updated = replyService.updateReply(reply);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReply(@PathVariable Long id) {
        replyService.deleteReply(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reply> getReplyById(@PathVariable Long id) {
        Reply reply = replyService.getReplyById(id);
        return reply != null ? ResponseEntity.ok(reply) : ResponseEntity.notFound().build();
    }

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<List<Reply>> getRepliesByComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(replyService.getRepliesByComment(commentId));
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<Reply>> getRepliesByAuthor(@PathVariable Long authorId) {
        return ResponseEntity.ok(replyService.getRepliesByAuthor(authorId));
    }
}
