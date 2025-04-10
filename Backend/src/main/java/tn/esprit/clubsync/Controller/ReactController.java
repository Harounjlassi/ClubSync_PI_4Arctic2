package tn.esprit.clubsync.Controller;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.IReactService;
import tn.esprit.clubsync.entities.React;

import java.util.List;

@RestController
@RequestMapping("/api/reacts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ReactController {

    @Autowired
    private IReactService reactService;

    @PostMapping
    public ResponseEntity<React> createReact(@RequestBody React react) {
        return ResponseEntity.ok(reactService.addReact(react));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReact(@PathVariable Long id) {
        reactService.removeReact(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<React> getReactById(@PathVariable Long id) {
        React react = reactService.getReactById(id);
        return react != null ? ResponseEntity.ok(react) : ResponseEntity.notFound().build();
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<React>> getReactsByForumPost(@PathVariable Long postId) {
        return ResponseEntity.ok(reactService.getReactsByForumPost(postId));
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<React>> getReactsByAuthor(@PathVariable Long authorId) {
        return ResponseEntity.ok(reactService.getReactsByAuthor(authorId));
    }

    @GetMapping("/count/{postId}/{type}")
    public ResponseEntity<Long> countReactsByType(
            @PathVariable Long postId,
            @PathVariable React.ReactType type) {
        return ResponseEntity.ok(reactService.countReactsByPostAndType(postId, type));
    }
    @PutMapping
    public ResponseEntity<React> updateReact(@RequestBody React react) {
        React updated = reactService.updateReact(react);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}