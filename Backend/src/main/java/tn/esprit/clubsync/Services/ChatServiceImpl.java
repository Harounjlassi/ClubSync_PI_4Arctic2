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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatClient chatClient;

    @Autowired
    private ClubRepo clubRepo;

    // Patterns for common question types
    private static final Pattern INFORMATION_PATTERN = Pattern.compile("(?:qu[e'](?:st-ce que|s-ce|l est)|c'est quoi|info|parle[rz]?\\s+(?:de|du|des)|dis[\\s-]moi|explique[rz]?|information|présente[rz]?|raconte[rz]?).*");
    private static final Pattern LISTING_PATTERN = Pattern.compile("(?:liste[rz]?|énumère[rz]?|montre[rz]?|affiche[rz]?|donner?\\s+la\\s+liste|quels?\\s+sont|y\\s+a[\\s-]t[\\s-]il|existe[\\s-]t[\\s-]il).*");
    private static final Pattern RECOMMENDATION_PATTERN = Pattern.compile("(?:recommend|suggère[rz]?|conseil[ls]e[rz]?|propose[rz]?|meilleur).*");
    private static final Pattern COMPARISON_PATTERN = Pattern.compile("(?:compare[rz]?|différence|versus|vs|ou).*");
    private static final Pattern GREETING_PATTERN = Pattern.compile("(?:bonjour|salut|hello|coucou|hey|hi|bonsoir|comment\\s+ça\\s+va).*");

    public ChatServiceImpl(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public String ask(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return "Bonjour ! Je suis le chatbot de ClubSync. Comment puis-je vous aider concernant nos clubs ?";
        }

        String cleanPrompt = prompt.trim();
        String lowerPrompt = cleanPrompt.toLowerCase();

        // Handle greetings specifically
        if (GREETING_PATTERN.matcher(lowerPrompt).matches() && lowerPrompt.split("\\s+").length <= 5) {
            return handleGreeting(lowerPrompt);
        }

        // Check if the question is about clubs
        if (containsClubRelatedTerms(lowerPrompt)) {
            // Handle general questions about the ClubSync platform
            if (isAboutClubSyncPlatform(lowerPrompt)) {
                return handleClubSyncPlatformQuestion(lowerPrompt);
            }

            // Handle listing requests (all clubs or by category)
            if (LISTING_PATTERN.matcher(lowerPrompt).matches() || lowerPrompt.contains("liste")) {
                // Check if requesting all clubs
                if (isAskingForAllClubs(lowerPrompt)) {
                    return listAllClubs();
                }

                // Check for category-based club requests
                String category = extractCategory(lowerPrompt);
                if (category != null) {
                    List<Club> clubsInCategory = clubRepo.findByCategorieIgnoreCase(category);
                    if (clubsInCategory.isEmpty()) {
                        return "Aucun club trouvé dans la catégorie " + category + ". Voulez-vous voir la liste de tous nos clubs ?";
                    } else {
                        return formatClubsInCategory(clubsInCategory, category);
                    }
                }
            }

            // Handle recommendations
            if (RECOMMENDATION_PATTERN.matcher(lowerPrompt).matches()) {
                String category = extractCategory(lowerPrompt);
                if (category != null) {
                    return recommendClubsInCategory(category);
                } else {
                    return recommendPopularClubs();
                }
            }

            // Check for specific club information
            String clubName = extractClubName(prompt);
            if (clubName != null && !clubName.isEmpty()) {
                return handleSpecificClubQuery(clubName, lowerPrompt);
            }

            // If we reached here, it's a club-related question but we couldn't determine specifics
            return "Je comprends que vous vous intéressez à nos clubs, mais je n'ai pas saisi précisément votre demande. Voulez-vous des informations sur un club spécifique, voir la liste des clubs par catégorie, ou avoir des recommandations ?";
        } else {
            // For non-club related questions, return a polite message with guidance
            return "Je suis désolé, je suis spécialisé dans les informations concernant les clubs de ClubSync. Pour toute autre question, merci de contacter notre équipe support. Puis-je vous aider à découvrir nos clubs ou à trouver des informations sur un club spécifique ?";
        }
    }

    private String handleGreeting(String lowerPrompt) {
        if (lowerPrompt.contains("va") || lowerPrompt.contains("ça va")) {
            return "Bonjour ! Je vais très bien, merci de demander. Je suis le chatbot de ClubSync, prêt à vous aider avec toutes vos questions concernant nos clubs. Que souhaitez-vous savoir ?";
        }
        return "Bonjour ! Je suis le chatbot de ClubSync. Je peux vous renseigner sur nos différents clubs, leurs activités, ou vous aider à trouver un club qui correspond à vos centres d'intérêt. Comment puis-je vous aider aujourd'hui ?";
    }

    private boolean isAboutClubSyncPlatform(String lowerPrompt) {
        List<String> platformTerms = Arrays.asList(
                "clubsync", "plateforme", "application", "site", "service", "fonctionnement", "fonctionne",
                "comment utiliser", "comment ça marche", "comment s'inscrire", "inscription", "adhésion"
        );
        return platformTerms.stream().anyMatch(lowerPrompt::contains);
    }

    private String handleClubSyncPlatformQuestion(String lowerPrompt) {
        if (lowerPrompt.contains("inscription") || lowerPrompt.contains("adhésion") || lowerPrompt.contains("s'inscrire") || lowerPrompt.contains("rejoindre")) {
            return "Pour vous inscrire à un club sur ClubSync, c'est très simple :\n\n" +
                    "1. Créez un compte sur notre plateforme ou connectez-vous\n" +
                    "2. Parcourez notre catalogue de clubs\n" +
                    "3. Visitez la page du club qui vous intéresse\n" +
                    "4. Cliquez sur le bouton \"Rejoindre le club\"\n" +
                    "5. Suivez les instructions pour compléter votre adhésion\n\n" +
                    "Certains clubs peuvent avoir des critères d'admission spécifiques ou des frais d'adhésion. Ces informations sont détaillées sur la page de chaque club.";
        } else if (lowerPrompt.contains("fonctionnement") || lowerPrompt.contains("fonctionne") || lowerPrompt.contains("comment ça marche")) {
            return "ClubSync est une plateforme qui centralise tous les clubs de l'établissement. Voici comment ça fonctionne :\n\n" +
                    "• Parcourez les clubs par catégorie ou recherchez un club spécifique\n" +
                    "• Consultez les détails de chaque club (description, activités, membres, événements)\n" +
                    "• Rejoignez les clubs qui vous intéressent\n" +
                    "• Participez aux événements et activités\n" +
                    "• Communiquez avec les autres membres\n\n" +
                    "ClubSync facilite la gestion des clubs et rend l'information accessible à tous les étudiants.";
        } else {
            return "ClubSync est la plateforme officielle de gestion des clubs de notre établissement. Elle permet de :\n\n" +
                    "• Découvrir tous les clubs disponibles\n" +
                    "• Consulter leurs activités et événements\n" +
                    "• Rejoindre facilement un club\n" +
                    "• Rester informé des actualités\n\n" +
                    "Que souhaitez-vous savoir de plus sur ClubSync ou nos clubs ?";
        }
    }

    private boolean isAskingForAllClubs(String lowerPrompt) {
        List<String> allClubsTerms = Arrays.asList(
                "tous les clubs", "toutes les associations", "liste complète", "liste des clubs",
                "ensemble des clubs", "tous les", "toutes les", "tous vos clubs", "toutes vos associations"
        );
        return allClubsTerms.stream().anyMatch(lowerPrompt::contains);
    }

    private String listAllClubs() {
        List<Club> allClubs = clubRepo.findAll();
        if (allClubs.isEmpty()) {
            return "Aucun club n'est actuellement enregistré dans notre système.";
        }

        // Group clubs by category
        Map<String, List<Club>> clubsByCategory = new HashMap<>();
        for (Club club : allClubs) {
            String category = club.getCategorie() != null ? club.getCategorie() : "Autre";
            clubsByCategory.computeIfAbsent(category, k -> new ArrayList<>()).add(club);
        }

        StringBuilder response = new StringBuilder();
        response.append("📋 **Liste complète de nos clubs** 📋\n\n");

        clubsByCategory.forEach((category, clubs) -> {
            response.append(getCategoryIcon(category)).append(" **").append(category.toUpperCase()).append("** (").append(clubs.size()).append(")\n");
            clubs.forEach(club -> {
                response.append("   • ").append(club.getName()).append("\n");
            });
            response.append("\n");
        });

        response.append("Pour plus de détails sur un club spécifique, demandez-moi des informations sur le club qui vous intéresse.");
        return response.toString();
    }

    private String recommendClubsInCategory(String category) {
        List<Club> clubsInCategory = clubRepo.findByCategorieIgnoreCase(category);
        if (clubsInCategory.isEmpty()) {
            return "Je n'ai pas de clubs à recommander dans la catégorie " + category + " car aucun n'est enregistré. Voulez-vous explorer une autre catégorie ?";
        }

        // Sort by some criteria (e.g., number of members as a proxy for popularity)
        clubsInCategory.sort((c1, c2) -> c2.getMembers().size() - c1.getMembers().size());

        // Take top 3 or fewer if less than 3 available
        List<Club> recommendedClubs = clubsInCategory.subList(0, Math.min(3, clubsInCategory.size()));

        StringBuilder response = new StringBuilder();
        response.append("🌟 **Clubs recommandés en ").append(category.toUpperCase()).append("** 🌟\n\n");

        for (int i = 0; i < recommendedClubs.size(); i++) {
            Club club = recommendedClubs.get(i);
            response.append((i + 1)).append(". **").append(club.getName()).append("**\n")
                    .append("   _\"").append(club.getSlogan()).append("\"_\n")
                    .append("   👥 ").append(club.getMembers().size()).append(" membres\n")
                    .append("   📝 ").append(truncateDescription(club.getDescription(), 100)).append("\n\n");
        }

        response.append("Ces clubs sont particulièrement actifs et populaires. Pour rejoindre l'un d'entre eux ou en savoir plus, demandez-moi des détails sur celui qui vous intéresse !");
        return response.toString();
    }

    private String recommendPopularClubs() {
        List<Club> allClubs = clubRepo.findAll();
        if (allClubs.isEmpty()) {
            return "Aucun club n'est actuellement enregistré dans notre système pour vous faire des recommandations.";
        }

        // Sort by number of members (popularity)
        allClubs.sort((c1, c2) -> c2.getMembers().size() - c1.getMembers().size());

        // Take top 3 or fewer if less than 3 available
        List<Club> popularClubs = allClubs.subList(0, Math.min(3, allClubs.size()));

        StringBuilder response = new StringBuilder();
        response.append("🏆 **Clubs les plus populaires** 🏆\n\n");

        for (int i = 0; i < popularClubs.size(); i++) {
            Club club = popularClubs.get(i);
            response.append((i + 1)).append(". **").append(club.getName()).append("** (").append(club.getCategorie()).append(")\n")
                    .append("   _\"").append(club.getSlogan()).append("\"_\n")
                    .append("   👥 ").append(club.getMembers().size()).append(" membres\n")
                    .append("   📝 ").append(truncateDescription(club.getDescription(), 100)).append("\n\n");
        }

        response.append("Ces clubs sont nos plus populaires en ce moment. Vous pouvez me demander plus de détails sur celui qui vous intéresse !");
        return response.toString();
    }

    private String handleSpecificClubQuery(String clubName, String lowerPrompt) {
        Optional<Club> optionalClub = clubRepo.findByNameContainingIgnoreCase(clubName);
        if (optionalClub.isPresent()) {
            Club club = optionalClub.get();

            // Extract information type from query
            if (lowerPrompt.contains("description") || lowerPrompt.contains("objectif") || lowerPrompt.contains("présentation") ||
                    lowerPrompt.contains("c'est quoi") || lowerPrompt.contains("parle") || INFORMATION_PATTERN.matcher(lowerPrompt).matches()) {
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
            if (lowerPrompt.contains("membres") || lowerPrompt.contains("combien") || lowerPrompt.contains("nombre") ||
                    lowerPrompt.contains("participant") || lowerPrompt.contains("adhérent")) {
                return "👥 **Membres du club " + club.getName() + "**\n\n"
                        + club.getMembers().size() + " membres actifs\n\n✨ *Slogan* : \"" + club.getSlogan() + "\"";
            }
            if (lowerPrompt.contains("créateur") || lowerPrompt.contains("fondateur") || lowerPrompt.contains("président") ||
                    lowerPrompt.contains("responsable") || lowerPrompt.contains("qui a créé")) {
                return club.getCreator() != null ?
                        "👤 **Créateur du club " + club.getName() + "**\n\n"
                                + club.getCreator().getFirstname() + " " + club.getCreator().getLastname()
                                + "\n\n🏆 *Catégorie* : " + club.getCategorie() :
                        "❌ **Créateur non renseigné**\n\nLe club " + club.getName() + " n'a pas de créateur enregistré.";
            }
            if (lowerPrompt.contains("rejoindre") || lowerPrompt.contains("inscription") || lowerPrompt.contains("adhésion") ||
                    lowerPrompt.contains("adhérer") || lowerPrompt.contains("comment s'inscrire")) {
                return "📝 **Comment rejoindre le club " + club.getName() + "**\n\n"
                        + "Pour rejoindre ce club, suivez ces étapes :\n\n"
                        + "1. Connectez-vous à votre compte ClubSync\n"
                        + "2. Visitez la page du club " + club.getName() + "\n"
                        + "3. Cliquez sur le bouton \"Rejoindre\"\n"
                        + "4. Suivez les instructions complémentaires\n\n"
                        + "👥 Le club compte actuellement " + club.getMembers().size() + " membres\n\n"
                        + "Pour toute question spécifique, vous pouvez contacter directement les responsables du club.";
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
                return "Je n'ai pas trouvé de club nommé \"" + clubName + "\". Vouliez-vous dire : **" + suggestedName + "** ?";
            } else {
                return "Je n'ai pas trouvé de club nommé \"" + clubName + "\". Vous pouvez consulter la liste de tous nos clubs en me demandant \"liste des clubs\".";
            }
        }
    }

    // Helper method to check if the prompt contains club-related terms
    private boolean containsClubRelatedTerms(String lowerPrompt) {
        List<String> clubTerms = Arrays.asList(
                "club", "association", "groupe", "organisation", "équipe",
                "adhérent", "membre", "inscription", "rejoindre", "adhésion",
                "activité", "événement", "réunion", "rencontre", "session",
                "sport", "art", "culture", "musique", "technologie", "science", "littérature",
                "président", "secrétaire", "trésorier", "responsable", "animateur", "créateur", "fondateur",
                "clubsync", "participer", "s'inscrire", "adhérer"
        );

        return clubTerms.stream().anyMatch(lowerPrompt::contains);
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

    private String truncateDescription(String description, int maxLength) {
        if (description == null) return "Description non disponible";
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
            case "art" -> "🎨";
            case "littérature" -> "📚";
            case "culture" -> "🎭";
            default -> "🔍";
        };
    }

    private String extractClubName(String prompt) {
        String promptLower = prompt.toLowerCase().replaceAll("[^a-z0-9éèàùâêîôûäëïöüç]", " ");
        List<Club> allClubs = clubRepo.findAll();

        // Enhanced search logic
        Map<Club, Integer> matches = new LinkedHashMap<>();

        for (Club club : allClubs) {
            String cleanClubName = club.getName()
                    .toLowerCase()
                    .replaceAll("[^a-z0-9éèàùâêîôûäëïöüç]", " ")
                    .trim();

            // Multi-criteria verification
            int score = 0;

            // 1. Exact match
            if ((" " + promptLower + " ").contains(" " + cleanClubName + " ")) {
                score += 100;
            }

            // 2. Levenshtein similarity
            LevenshteinDistance ld = new LevenshteinDistance();
            int distance = ld.apply(promptLower, cleanClubName);
            score += (30 - Math.min(distance, 30)); // Max score 30 for distance 0

            // 3. Common keywords
            Set<String> promptWords = new HashSet<>(Arrays.asList(promptLower.split(" ")));
            Set<String> clubWords = new HashSet<>(Arrays.asList(cleanClubName.split(" ")));
            clubWords.retainAll(promptWords);
            score += clubWords.size() * 20;

            // 4. Pattern-based search for club name preceded by "club" or similar words
            Pattern clubNamePattern = Pattern.compile("(?:club|association)\\s+([\\w\\s]+)");
            Matcher matcher = clubNamePattern.matcher(promptLower);
            if (matcher.find()) {
                String extractedName = matcher.group(1).trim();
                if (cleanClubName.contains(extractedName) || extractedName.contains(cleanClubName)) {
                    score += 50;
                }
            }

            matches.put(club, score);
        }

        // Find best match
        return matches.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .filter(e -> e.getValue() > 40) // Minimum confidence threshold
                .map(e -> e.getKey().getName())
                .orElse(null);
    }

    private String formatClubsInCategory(List<Club> clubs, String category) {
        if (clubs.isEmpty()) {
            return "Aucun club trouvé dans la catégorie " + category + " 🧐\n\nEssayez une autre catégorie !";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(getCategoryIcon(category)).append(" **Clubs de ").append(category.toUpperCase()).append("** ").append(getCategoryIcon(category)).append("\n\n");

        clubs.forEach(club -> {
            sb.append("🔹 **").append(club.getName()).append("** (").append(club.getMembers().size()).append(" membres)\n")
                    .append("   _\"").append(club.getSlogan()).append("\"_\n")
                    .append("   📌 ").append(truncateDescription(club.getDescription(), 100)).append("\n\n");
        });

        sb.append("👉 Pour plus de détails sur un club spécifique, demandez-moi des informations sur le club qui vous intéresse !");
        return sb.toString();
    }

    private String formatClubDetails(Club club) {
        StringBuilder sb = new StringBuilder();
        sb.append("🎯 **").append(club.getName()).append("**\n\n");
        sb.append("📝 *Description* :\n").append(club.getDescription()).append("\n\n");
        sb.append("🏷️ *Catégorie* : ").append(getCategoryIcon(club.getCategorie())).append(" ").append(club.getCategorie()).append("\n");
        sb.append("💬 *Slogan* : \"").append(club.getSlogan()).append("\"\n");
        sb.append("👥 *Membres* : ").append(club.getMembers().size()).append(" participants\n");
        if (club.getCreator() != null) {
            sb.append("👤 *Créateur* : ").append(club.getCreator().getFirstname()).append(" ")
                    .append(club.getCreator().getLastname()).append("\n");
        }
        sb.append("\nℹ️ Pour rejoindre ce club ou obtenir plus d'informations, connectez-vous à l'application ClubSync ou contactez directement les responsables du club.");
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
                    if (lowerFileName.contains("club") || lowerFileName.contains("association")) {
                        return "📄 Fichier PDF \"" + fileName + "\" uploadé avec succès! Si ce document contient des informations sur les clubs, je pourrai l'analyser pour vous aider.";
                    } else {
                        return "📄 Fichier PDF \"" + fileName + "\" uploadé avec succès! Notez que je suis spécialisé dans les informations sur les clubs. Si vous avez des questions à ce sujet, n'hésitez pas à me demander.";
                    }
                }

                // Traitement des images
                else if (contentType != null && contentType.startsWith("image/")) {
                    // Déterminer le type d'image
                    String imageType = contentType.substring(6); // après "image/"
                    if (lowerFileName.contains("club") || lowerFileName.contains("event") || lowerFileName.contains("activité")) {
                        return "🖼️ Image \"" + fileName + "\" (" + imageType + ") uploadée avec succès! Si elle contient des informations sur les clubs ou leurs événements, je ferai de mon mieux pour vous aider.";
                    } else {
                        return "🖼️ Image \"" + fileName + "\" (" + imageType + ") uploadée avec succès! Pour des questions relatives aux clubs, n'hésitez pas à me demander.";
                    }
                }

                // Documents Word ou autres
                else if (lowerFileName.endsWith(".doc") || lowerFileName.endsWith(".docx")) {
                    return "📝 Document \"" + fileName + "\" uploadé avec succès! S'il contient des informations sur les clubs, n'hésitez pas à me poser des questions spécifiques.";
                }
            }

            // Œufs de Pâques et autres logiques spéciales
            if (fileName != null &&
                    (fileName.toLowerCase().contains("easter") ||
                            fileName.toLowerCase().contains("paques") ||
                            fileName.toLowerCase().contains("pâques"))) {
                return "🐰 Fichier secret découvert! 🥚 Joyeuses Pâques! Le fichier \"" + fileName + "\" a été uploadé avec succès.";
            }

            LocalDate today = LocalDate.now();
            if (today.getMonth() == Month.APRIL && today.getDayOfMonth() == 1) {
                return "Fichier \"" + fileName + "\" uploadé avec succès! 🎭 C'est un jour spécial aujourd'hui, non ? 😉";
            } else if (today.getMonth() == Month.APRIL) {
                return "Fichier \"" + fileName + "\" uploadé avec succès! 🥚";
            }

            // Réponse par défaut
            return "✅ Fichier \"" + fileName + "\" uploadé avec succès! Si vous avez des questions concernant les clubs, je suis à votre disposition.";
        } catch (Exception e) {
            return "❌ Erreur lors du traitement du fichier: " + e.getMessage();
        }
    }
}