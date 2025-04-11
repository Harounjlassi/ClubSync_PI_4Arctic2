package tn.esprit.clubsync.Services;

import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.MessageRepository;
import tn.esprit.clubsync.entities.Message;


import java.io.IOException;
import java.util.List;

@Service
public class MessageServiceImpl implements  iMessageService{

    private final MessageRepository messageRepository;

    // Constructor injection is recommended
    public MessageServiceImpl(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Override
    public Message saveMessage(Message message) throws IOException {
        // Add any business logic/validation before saving
        return messageRepository.save(message);
    }

    @Override
    public Message updateMessage(Message Message, Long id) {
        // Check if Message exists
        Message existingMessage = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));

        // Update fields - adjust according to your entity structure
        existingMessage.setId(Message.getId());
        existingMessage.setContenu(Message.getContenu());
        existingMessage.setProjetId(Message.getProjetId());
        existingMessage.setDateCreated(Message.getDateCreated());
        existingMessage.setLastUpdated(Message.getLastUpdated());


        // ... update other fields as needed

        return messageRepository.save(existingMessage);
    }

    @Override
    public void deleteMessage(Message Message) {
        messageRepository.delete(Message);
    }

    @Override
    public void deleteMessageById(Long id) {
        messageRepository.deleteById(id);
    }

    @Override
    public List<Message> findMessages() {

        return messageRepository.findAll();


    }

    @Override
    public Message findById(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
    }

    public List<Message> searchMessageByIdProjet(Long idProjet) {
        return messageRepository.searchMessageByIdProjet(idProjet);

    }
}
