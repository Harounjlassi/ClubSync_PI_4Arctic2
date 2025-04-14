package tn.esprit.clubsync.Services;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.clubsync.Repo.ClubRepo;
import tn.esprit.clubsync.entities.Club;
import org.apache.commons.text.similarity.LevenshteinDistance;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.Month;
import java.util.*;


@Service
public class ChatServiceImpl implements ChatService {

    private final ChatClient chatClient;

    @Autowired
    private ClubRepo clubRepo;



    public ChatServiceImpl(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public String ask(String prompt) {
        String lowerPrompt = prompt.toLowerCase();

        // Vérifie si la question concerne un club
        if (lowerPrompt.contains("club")) {
            String clubName = extractClubName(prompt);
            if (clubName != null && !clubName.isEmpty()) {
                Optional<Club> optionalClub = clubRepo.findByNameContainingIgnoreCase(clubName);
                if (optionalClub.isPresent()) {
                    Club club = optionalClub.get();

                    // Analyse du type de demande spécifique
                    if (lowerPrompt.contains("description") || lowerPrompt.contains("objectif") || lowerPrompt.contains("présentation")) {
                        return "Description du club " + club.getName() + " : " + club.getDescription();
                    }
                    if (lowerPrompt.contains("slogan") || lowerPrompt.contains("devise") || lowerPrompt.contains("phrase")) {
                        return "Slogan du club " + club.getName() + " : \"" + club.getSlogan() + "\"";
                    }
                    if (lowerPrompt.contains("catégorie") || lowerPrompt.contains("type") || lowerPrompt.contains("domaine")) {
                        return "Le club " + club.getName() + " appartient à la catégorie : " + club.getCategorie();
                    }
                    if (lowerPrompt.contains("membres") || lowerPrompt.contains("combien") || lowerPrompt.contains("nombre")) {
                        return "Le club " + club.getName() + " compte " + club.getMembers().size() + " membres.";
                    }
                    if (lowerPrompt.contains("créateur") || lowerPrompt.contains("fondateur")) {
                        if (club.getCreator() != null) {
                            return "Créateur du club " + club.getName() + " : " + club.getCreator().getFirstname();
                        } else {
                            return "Le créateur du club " + club.getName() + " n'est pas renseigné.";
                        }
                    }

                    // Si aucun mot-clé spécifique n'est trouvé, retourner les détails complets
                    return formatClubDetails(club);
                } else {
                    // Suggestion en cas de non-correspondance exacte
                    List<Club> allClubs = clubRepo.findAll();
                    String suggestedName = null;
                    int bestDistance = Integer.MAX_VALUE;

                    for (Club c : allClubs) {
                        LevenshteinDistance ld = new LevenshteinDistance();
                        int distance = ld.apply(clubName.toLowerCase(), c.getName().toLowerCase());
                        if (distance < bestDistance) {
                            bestDistance = distance;
                            suggestedName = c.getName();
                        }
                    }

                    if (suggestedName != null && bestDistance <= 3) {
                        return "Aucun club trouvé portant le nom : " + clubName + ". Vouliez-vous dire : **" + suggestedName + "** ?";
                    } else {
                        return "Aucun club trouvé portant le nom : " + clubName;
                    }
                }
            } else {
                return "Je n'ai pas pu identifier le nom du club dans ta question.";
            }
        }

        // Pour les autres questions, utiliser le comportement par défaut (ChatClient)
        return chatClient.prompt(prompt)
                .call()
                .content();
    }



    private String extractClubName(String prompt) {
        String promptLower = prompt.toLowerCase().replaceAll("[^a-z0-9éèàùâêîôûäëïöüç]", " ");
        List<Club> allClubs = clubRepo.findAll(); // Assurez-vous que cette méthode flush le cache si nécessaire

        // Nouvelle logique de recherche améliorée
        Map<Club, Integer> matches = new LinkedHashMap<>();

        for (Club club : allClubs) {
            String cleanClubName = club.getName()
                    .toLowerCase()
                    .replaceAll("[^a-z0-9éèàùâêîôûäëïöüç]", " ")
                    .trim();

            // Vérification multicritère
            int score = 0;

            // 1. Correspondance exacte
            if ((" " + promptLower + " ").contains(" " + cleanClubName + " ")) {
                score += 100;
            }

            // 2. Similarité de Levenshtein
            LevenshteinDistance ld = new LevenshteinDistance();
            int distance = ld.apply(promptLower, cleanClubName);
            score += (30 - Math.min(distance, 30)); // Score maximum 30 pour distance 0

            // 3. Mots-clés communs
            Set<String> promptWords = new HashSet<>(Arrays.asList(promptLower.split(" ")));
            Set<String> clubWords = new HashSet<>(Arrays.asList(cleanClubName.split(" ")));
            clubWords.retainAll(promptWords);
            score += clubWords.size() * 20;

            matches.put(club, score);
        }

        // Trouver le meilleur match
        return matches.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .filter(e -> e.getValue() > 40) // Seuil minimum de confiance
                .map(e -> e.getKey().getName())
                .orElse(null);
    }



    private String formatClubDetails(Club club) {
        StringBuilder sb = new StringBuilder();
        sb.append("Nom : ").append(club.getName()).append("\n");
        sb.append("Description : ").append(club.getDescription()).append("\n");
        sb.append("Catégorie : ").append(club.getCategorie()).append("\n");
        sb.append("Slogan : ").append(club.getSlogan()).append("\n");
        // Vérifier si le créateur est renseigné
        sb.append("Créateur : ").append(club.getCreator() != null ? club.getCreator().getFirstname() : "Non renseigné").append("\n");
        sb.append("Nombre de membres : ").append(club.getMembers() != null ? club.getMembers().size() : 0).append("\n");
        // Vous pouvez étendre en ajoutant les événements ou discussions si besoin
        return sb.toString();
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