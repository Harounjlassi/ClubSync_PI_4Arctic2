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

        // Check if the question is about clubs
        if (lowerPrompt.contains("club")) {

            // New logic: Check for category-based club requests
            String category = extractCategory(lowerPrompt);
            if (category != null && isAskingForClubsInCategory(lowerPrompt)) {
                List<Club> clubsInCategory = clubRepo.findByCategorieIgnoreCase(category);
                if (clubsInCategory.isEmpty()) {
                    return "Aucun club trouvé dans la catégorie " + category + ".";
                } else {
                    return formatClubsInCategory(clubsInCategory, category);
                }
            }

            // Existing logic for specific club information
            String clubName = extractClubName(prompt);
            if (clubName != null && !clubName.isEmpty()) {
                Optional<Club> optionalClub = clubRepo.findByNameContainingIgnoreCase(clubName);
                if (optionalClub.isPresent()) {
                    Club club = optionalClub.get();

                    // Analyse du type de demande spécifique
                    if (lowerPrompt.contains("description") || lowerPrompt.contains("objectif") || lowerPrompt.contains("présentation")) {
                        return "📚 **Description du club " + club.getName() + "**\n\n"
                                + club.getDescription() + "\n\n💡 *Slogan* : \"" + club.getSlogan() + "\"";
                    }
                    if (lowerPrompt.contains("slogan") || lowerPrompt.contains("devise") || lowerPrompt.contains("phrase")) {
                        return "💫 **Slogan du club " + club.getName() + "**\n\n« "
                                + club.getSlogan() + " »\n\n_" + club.getDescription() + "_";
                    }
                    if (lowerPrompt.contains("catégorie") || lowerPrompt.contains("type") || lowerPrompt.contains("domaine")) {
                        return "🏷️ **Catégorie du club " + club.getName() + "**\n\n"
                                + club.getCategorie() + "\n\n💡 *Description* : " + club.getDescription();
                    }
                    if (lowerPrompt.contains("membres") || lowerPrompt.contains("combien") || lowerPrompt.contains("nombre")) {
                        return "👥 **Membres du club " + club.getName() + "**\n\n"
                                + club.getMembers().size() + " membres actifs\n\n✨ *Slogan* : \"" + club.getSlogan() + "\"";
                    }
                    if (lowerPrompt.contains("créateur") || lowerPrompt.contains("fondateur")) {
                        return club.getCreator() != null ?
                                "👤 **Créateur du club " + club.getName() + "**\n\n"
                                        + club.getCreator().getFirstname() + " " + club.getCreator().getLastname()
                                        + "\n\n🏆 *Catégorie* : " + club.getCategorie() :
                                "❌ **Créateur non renseigné**\n\nLe club " + club.getName() + " n'a pas de créateur enregistré.";
                    }

                    // Default: Return full club details
                    return formatClubDetails(club);
                } else {
                    // Suggest similar club names if no exact match
                    List<Club> allClubs = clubRepo.findAll();
                    String suggestedName = null;
                    int bestDistance = Integer.MAX_VALUE;
                    LevenshteinDistance ld = new LevenshteinDistance();

                    for (Club c : allClubs) {
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

        // Default behavior for non-club related questions
        return chatClient.prompt(prompt)
                .call()
                .content();
    }

    // Helper method to extract category from the prompt
    private String extractCategory(String lowerPrompt) {
        List<String> categories = Arrays.asList("sport", "art", "culture", "musique", "technologie", "science", "littérature", "autre");
        LevenshteinDistance levenshtein = new LevenshteinDistance();
        String bestMatch = null;
        int minDistance = Integer.MAX_VALUE;

        for (String category : categories) {
            if (lowerPrompt.contains(category)) {
                return category; // Exact match
            }
            // Check for approximate match using Levenshtein distance
            int distance = levenshtein.apply(lowerPrompt, category);
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = category;
            }
        }

        // Threshold for typo tolerance (adjust as needed)
        return (minDistance <= 2) ? bestMatch : null;
    }

    // Check if the prompt is asking for clubs in a category
    private boolean isAskingForClubsInCategory(String lowerPrompt) {
        List<String> keywords = Arrays.asList(
                "suggérer", "suggestion", "liste", "recommander", "quels", "quelles",
                "clubs dans", "clubs de", "clubs en", "catégorie", "recommandations"
        );
        return keywords.stream().anyMatch(lowerPrompt::contains);
    }

    // Format the list of clubs in a category
    private String formatClubsInCategory(List<Club> clubs, String category) {
        if (clubs.isEmpty()) {
            return "Aucun club trouvé dans la catégorie " + category + " 🧐\n\nEssayez une autre catégorie !";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("🏆 **Clubs de ").append(category.toUpperCase()).append("** 🏆\n\n");

        clubs.forEach(club -> {
            sb.append("🔹 **").append(club.getName()).append("**\n")
                    .append("   _\"").append(club.getSlogan()).append("\"_\n")
                    .append("   📌 ").append(truncateDescription(club.getDescription(), 100)).append("\n\n");
        });

        sb.append("👉 Tapez le nom d'un club pour voir ses détails complets !");
        return sb.toString();
    }

    private String truncateDescription(String description, int maxLength) {
        if (description.length() <= maxLength) return description;

        return description.substring(0, maxLength - 3)
                + "..."
                + (description.charAt(maxLength - 3) != ' ' ? " " : "");
    }
    private String getCategoryIcon(String category) {
        return switch (category.toLowerCase()) {
            case "sport" -> "⚽";
            case "musique" -> "🎵";
            case "technologie" -> "💻";
            case "science" -> "🔬";
            default -> "🎭";
        };
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
        sb.append("🎯 **").append(club.getName()).append("**\n\n");
        sb.append("📝 *Description* :\n").append(club.getDescription()).append("\n\n");
        sb.append("🏷️ *Catégorie* : ").append(club.getCategorie()).append("\n");
        sb.append("💬 *Slogan* : \"").append(club.getSlogan()).append("\"\n");
        sb.append("👥 *Membres* : ").append(club.getMembers().size()).append(" participants\n");
        if (club.getCreator() != null) {
            sb.append("👤 *Créateur* : ").append(club.getCreator().getFirstname()).append(" ")
                    .append(club.getCreator().getLastname()).append("\n");
        }
        sb.append("\nℹ️ Pour plus d'informations, contactez-nous !");
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