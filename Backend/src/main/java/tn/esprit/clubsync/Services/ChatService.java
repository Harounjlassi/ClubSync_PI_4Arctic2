package tn.esprit.clubsync.Services;

import org.springframework.web.multipart.MultipartFile;

public interface ChatService {
    String ask(String prompt);
    String processFileUpload(MultipartFile file);

}
