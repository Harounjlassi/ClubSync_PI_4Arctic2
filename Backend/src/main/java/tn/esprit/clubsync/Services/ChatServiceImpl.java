package tn.esprit.clubsync.Services;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.Month;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatClient chatClient;

    public ChatServiceImpl(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public String ask(String prompt) {
        return chatClient.prompt(prompt)
                .call()
                .content();
    }

    @Override
    public String processFileUpload(MultipartFile file) {
        try {
            // Vérifier si le fichier est vide
            if (file.isEmpty()) {
                return "Fichier vide";
            }

            // Créer le répertoire d'upload s'il n'existe pas
            String uploadDir = "uploads";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Sauvegarder le fichier
            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            Path path = Paths.get(uploadDir + File.separator + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            // Traitement selon le type de fichier
            if (fileName != null) {
                String lowerFileName = fileName.toLowerCase();

                // Traitement des PDFs
                if (lowerFileName.endsWith(".pdf")) {
                    // Code pour extraire le contenu PDF...
                    return "Fichier PDF " + fileName + " uploadé avec succès! Je peux analyser son contenu si vous me le demandez.";
                }

                // Traitement des images
                else if (contentType != null && contentType.startsWith("image/")) {
                    // Déterminer le type d'image
                    String imageType = contentType.substring(6); // après "image/"
                    return "Image " + fileName + " (" + imageType + ") uploadée avec succès! Je peux la décrire si vous me le demandez.";
                }
            }

            // Œufs de Pâques et autres logiques comme avant...
            if (fileName != null &&
                    (fileName.toLowerCase().contains("easter") ||
                            fileName.toLowerCase().contains("paques") ||
                            fileName.toLowerCase().contains("pâques"))) {
                return "🐰 Fichier secret découvert! 🥚 Joyeuses Pâques! Le fichier " + fileName + " a été uploadé avec succès.";
            }

            LocalDate today = LocalDate.now();
            if (today.getMonth() == Month.APRIL) {
                return "Fichier " + fileName + " uploadé avec succès! 🥚";
            }

            return "Fichier " + fileName + " uploadé avec succès!";
        } catch (Exception e) {
            return "Erreur lors du traitement du fichier: " + e.getMessage();
        }
    }

}