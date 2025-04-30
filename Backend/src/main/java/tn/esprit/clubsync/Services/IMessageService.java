package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.Message;

import java.io.IOException;
import java.util.List;

public interface iMessageService {
    Message saveMessage (Message Message) throws IOException;


    Message updateMessage (Message Message,Long idE);
    void deleteMessage (Message Message);
    void deleteMessageById (Long id);
    List<Message> findMessages();
    Message findById(Long id) ;

}
