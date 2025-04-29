package tn.esprit.clubsync.Controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.MessageServiceImpl;
import tn.esprit.clubsync.entities.Message;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/messages")
@CrossOrigin(origins = "http://localhost:4200")
public class MessageController {

    private final MessageServiceImpl messageService;

    public MessageController(MessageServiceImpl messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/all")
    public List<Message> getAllMessages() {
        return messageService.findMessages();
    }

    @PostMapping("/add")
    public ResponseEntity<Message> addMessage(@RequestBody Message Message) throws IOException {



        //afficge sur le console
        System.out.println("Message : " + Message.getProjet().getId());

        Message savedMessage = messageService.saveMessage(Message);
        return ResponseEntity.ok(savedMessage);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable Long id, @RequestBody Message Message) {
        Message.setId(id);
        Message updatedMessage = messageService.updateMessage(Message, id);
        return ResponseEntity.ok(Message);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessageById(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/getMessageByIdProjet/{IdProjet}")
    public ResponseEntity<List<Message>> searchMessageByIdProjet(@PathVariable Long IdProjet) {
        List<Message> existingTaches = messageService.searchMessageByIdProjet(IdProjet);
        return ResponseEntity.ok(existingTaches);
    }



}
