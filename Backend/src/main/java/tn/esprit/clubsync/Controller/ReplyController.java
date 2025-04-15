package tn.esprit.clubsync.Controller;


import lombok.Data;
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
    public ResponseEntity<?> createReply(@RequestBody Reply reply) {
        try {
            // Verify comment exists and is properly associated
            if (reply.getComment() == null || reply.getComment().getId_comment() == null) {
                return ResponseEntity.badRequest().body("Comment must be specified");
            }

            Reply savedReply = replyService.addReply(reply);
            return ResponseEntity.ok(savedReply);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
