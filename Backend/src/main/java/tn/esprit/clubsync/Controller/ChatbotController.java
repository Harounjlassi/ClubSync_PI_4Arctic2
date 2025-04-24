package tn.esprit.clubsync.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.clubsync.Services.ChatService;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/chat")
public class ChatbotController {

    private final ChatService chatService;

    public ChatbotController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public ResponseEntity<String> ask(@RequestParam String prompt) {
        String response = chatService.ask(prompt);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String result = chatService.processFileUpload(file);
            if (result.startsWith("Erreur") || result.equals("Fichier vide")) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors du traitement du fichier: " + e.getMessage());
        }
    }

}