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

    // Patterns for common question types in English
    private static final Pattern INFORMATION_PATTERN = Pattern.compile("(?:what(?:'s| is)|tell(?:\\s+me)?\\s+about|explain|describe|information|about|who|introduce).*");
    private static final Pattern LISTING_PATTERN = Pattern.compile("(?:list|show|display|give(?:\\s+me)?\\s+(?:a\\s+)?list|what\\s+(?:are|is)\\s+the|are\\s+there).*");
    private static final Pattern RECOMMENDATION_PATTERN = Pattern.compile("(?:recommend|suggest|advise|propose|best).*");
    private static final Pattern COMPARISON_PATTERN = Pattern.compile("(?:compare|difference|versus|vs|or).*");
    private static final Pattern GREETING_PATTERN = Pattern.compile("(?:hello|hi|hey|good\\s+(?:morning|afternoon|evening)|how\\s+are\\s+you).*");

    public ChatServiceImpl(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public String ask(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return "Hello! I'm the ClubSync chatbot. How can I help you with information about our clubs?";
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
            if (LISTING_PATTERN.matcher(lowerPrompt).matches() || lowerPrompt.contains("list")) {
                // Check if requesting all clubs
                if (isAskingForAllClubs(lowerPrompt)) {
                    return listAllClubs();
                }

                // Check for category-based club requests
                String category = extractCategory(lowerPrompt);
                if (category != null) {
                    List<Club> clubsInCategory = clubRepo.findByCategorieIgnoreCase(category);
                    if (clubsInCategory.isEmpty()) {
                        return "No clubs found in the " + category + " category. Would you like to see a list of all our clubs?";
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
            return "I understand you're interested in our clubs, but I'm not sure exactly what you're asking. Would you like information about a specific club, see a list of clubs by category, or get recommendations?";
        } else {
            // For non-club related questions, return a polite message with guidance
            return "I'm sorry, I specialize in providing information about ClubSync clubs. For any other questions, please contact our support team. Can I help you discover our clubs or find information about a specific club?";
        }
    }

    private String handleGreeting(String lowerPrompt) {
        if (lowerPrompt.contains("how are you")) {
            return "Hello! I'm doing great, thanks for asking. I'm the ClubSync chatbot, ready to help you with any questions about our clubs. What would you like to know?";
        }
        return "Hello! I'm the ClubSync chatbot. I can provide information about our various clubs, their activities, or help you find a club that matches your interests. How can I assist you today?";
    }

    private boolean isAboutClubSyncPlatform(String lowerPrompt) {
        List<String> platformTerms = Arrays.asList(
                "clubsync", "platform", "application", "site", "service", "how does it work", "works",
                "how to use", "how to sign up", "registration", "membership", "join"
        );
        return platformTerms.stream().anyMatch(lowerPrompt::contains);
    }

    private String handleClubSyncPlatformQuestion(String lowerPrompt) {
        if (lowerPrompt.contains("registration") || lowerPrompt.contains("membership") || lowerPrompt.contains("sign up") || lowerPrompt.contains("join")) {
            return "To join a club on ClubSync, it's very simple:\n\n" +
                    "1. Create an account on our platform or log in\n" +
                    "2. Browse our catalog of clubs\n" +
                    "3. Visit the page of the club that interests you\n" +
                    "4. Click on the \"Join club\" button\n" +
                    "5. Follow the instructions to complete your membership\n\n" +
                    "Some clubs may have specific admission criteria or membership fees. This information is detailed on each club's page.";
        } else if (lowerPrompt.contains("how does it work") || lowerPrompt.contains("works")) {
            return "ClubSync is a platform that centralizes all the clubs in the establishment. Here's how it works:\n\n" +
                    "• Browse clubs by category or search for a specific club\n" +
                    "• View details of each club (description, activities, members, events)\n" +
                    "• Join clubs that interest you\n" +
                    "• Participate in events and activities\n" +
                    "• Communicate with other members\n\n" +
                    "ClubSync facilitates club management and makes information accessible to all students.";
        } else {
            return "ClubSync is the official club management platform of our establishment. It allows you to:\n\n" +
                    "• Discover all available clubs\n" +
                    "• Check their activities and events\n" +
                    "• Easily join a club\n" +
                    "• Stay informed about news\n\n" +
                    "What else would you like to know about ClubSync or our clubs?";
        }
    }

    private boolean isAskingForAllClubs(String lowerPrompt) {
        List<String> allClubsTerms = Arrays.asList(
                "all clubs", "all associations", "complete list", "list of clubs",
                "all the clubs", "all of the", "all your clubs", "all your associations"
        );
        return allClubsTerms.stream().anyMatch(lowerPrompt::contains);
    }

    private String listAllClubs() {
        List<Club> allClubs = clubRepo.findAll();
        if (allClubs.isEmpty()) {
            return "No clubs are currently registered in our system.";
        }

        // Group clubs by category
        Map<String, List<Club>> clubsByCategory = new HashMap<>();
        for (Club club : allClubs) {
            String category = club.getCategorie() != null ? club.getCategorie() : "Other";
            clubsByCategory.computeIfAbsent(category, k -> new ArrayList<>()).add(club);
        }

        StringBuilder response = new StringBuilder();
        response.append("📋 **Complete List of Our Clubs** 📋\n\n");

        clubsByCategory.forEach((category, clubs) -> {
            response.append(getCategoryIcon(category)).append(" **").append(category.toUpperCase()).append("** (").append(clubs.size()).append(")\n");
            clubs.forEach(club -> {
                response.append("   • ").append(club.getName()).append("\n");
            });
            response.append("\n");
        });

        response.append("For more details about a specific club, ask me for information about the club you're interested in.");
        return response.toString();
    }

    private String recommendClubsInCategory(String category) {
        List<Club> clubsInCategory = clubRepo.findByCategorieIgnoreCase(category);
        if (clubsInCategory.isEmpty()) {
            return "I don't have any clubs to recommend in the " + category + " category as none are registered. Would you like to explore another category?";
        }

        // Sort by some criteria (e.g., number of members as a proxy for popularity)
        clubsInCategory.sort((c1, c2) -> c2.getMembers().size() - c1.getMembers().size());

        // Take top 3 or fewer if less than 3 available
        List<Club> recommendedClubs = clubsInCategory.subList(0, Math.min(3, clubsInCategory.size()));

        StringBuilder response = new StringBuilder();
        response.append("🌟 **Recommended ").append(category.toUpperCase()).append(" Clubs** 🌟\n\n");

        for (int i = 0; i < recommendedClubs.size(); i++) {
            Club club = recommendedClubs.get(i);
            response.append((i + 1)).append(". **").append(club.getName()).append("**\n")
                    .append("   _\"").append(club.getSlogan()).append("\"_\n")
                    .append("   👥 ").append(club.getMembers().size()).append(" members\n")
                    .append("   📝 ").append(truncateDescription(club.getDescription(), 100)).append("\n\n");
        }

        response.append("These clubs are particularly active and popular. To join one or learn more, ask me for details about the one that interests you!");
        return response.toString();
    }

    private String recommendPopularClubs() {
        List<Club> allClubs = clubRepo.findAll();
        if (allClubs.isEmpty()) {
            return "No clubs are currently registered in our system to make recommendations.";
        }

        // Sort by number of members (popularity)
        allClubs.sort((c1, c2) -> c2.getMembers().size() - c1.getMembers().size());

        // Take top 3 or fewer if less than 3 available
        List<Club> popularClubs = allClubs.subList(0, Math.min(3, allClubs.size()));

        StringBuilder response = new StringBuilder();
        response.append("🏆 **Most Popular Clubs** 🏆\n\n");

        for (int i = 0; i < popularClubs.size(); i++) {
            Club club = popularClubs.get(i);
            response.append((i + 1)).append(". **").append(club.getName()).append("** (").append(club.getCategorie()).append(")\n")
                    .append("   _\"").append(club.getSlogan()).append("\"_\n")
                    .append("   👥 ").append(club.getMembers().size()).append(" members\n")
                    .append("   📝 ").append(truncateDescription(club.getDescription(), 100)).append("\n\n");
        }

        response.append("These are our most popular clubs right now. You can ask me for more details about the one that interests you!");
        return response.toString();
    }

    private String handleSpecificClubQuery(String clubName, String lowerPrompt) {
        Optional<Club> optionalClub = clubRepo.findByNameContainingIgnoreCase(clubName);
        if (optionalClub.isPresent()) {
            Club club = optionalClub.get();

            // Extract information type from query
            if (lowerPrompt.contains("description") || lowerPrompt.contains("objective") || lowerPrompt.contains("presentation") ||
                    lowerPrompt.contains("what is") || lowerPrompt.contains("about") || INFORMATION_PATTERN.matcher(lowerPrompt).matches()) {
                return "📚 **Description of " + club.getName() + " club**\n\n"
                        + club.getDescription() + "\n\n💡 *Slogan* : \"" + club.getSlogan() + "\"";
            }
            if (lowerPrompt.contains("slogan") || lowerPrompt.contains("motto") || lowerPrompt.contains("phrase")) {
                return "💫 **Slogan of " + club.getName() + " club**\n\n« "
                        + club.getSlogan() + " »\n\n_" + club.getDescription() + "_";
            }
            if (lowerPrompt.contains("category") || lowerPrompt.contains("type") || lowerPrompt.contains("field")) {
                return "🏷️ **Category of " + club.getName() + " club**\n\n"
                        + club.getCategorie() + "\n\n💡 *Description* : " + club.getDescription();
            }
            if (lowerPrompt.contains("members") || lowerPrompt.contains("how many") || lowerPrompt.contains("number") ||
                    lowerPrompt.contains("participant") || lowerPrompt.contains("people")) {
                return "👥 **Members of " + club.getName() + " club**\n\n"
                        + club.getMembers().size() + " active members\n\n✨ *Slogan* : \"" + club.getSlogan() + "\"";
            }
            if (lowerPrompt.contains("creator") || lowerPrompt.contains("founder") || lowerPrompt.contains("president") ||
                    lowerPrompt.contains("leader") || lowerPrompt.contains("who created")) {
                return club.getCreator() != null ?
                        "👤 **Creator of " + club.getName() + " club**\n\n"
                                + club.getCreator().getFirstname() + " " + club.getCreator().getLastname()
                                + "\n\n🏆 *Category* : " + club.getCategorie() :
                        "❌ **Creator not specified**\n\nThe " + club.getName() + " club doesn't have a registered creator.";
            }
            if (lowerPrompt.contains("join") || lowerPrompt.contains("registration") || lowerPrompt.contains("membership") ||
                    lowerPrompt.contains("sign up") || lowerPrompt.contains("how to join")) {
                return "📝 **How to join the " + club.getName() + " club**\n\n"
                        + "To join this club, follow these steps:\n\n"
                        + "1. Log in to your ClubSync account\n"
                        + "2. Visit the " + club.getName() + " club page\n"
                        + "3. Click on the \"Join\" button\n"
                        + "4. Follow the additional instructions\n\n"
                        + "👥 The club currently has " + club.getMembers().size() + " members\n\n"
                        + "For any specific questions, you can contact the club leaders directly.";
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
                return "I couldn't find a club named \"" + clubName + "\". Did you mean: **" + suggestedName + "** ?";
            } else {
                return "I couldn't find a club named \"" + clubName + "\". You can see a list of all our clubs by asking me \"list of clubs\".";
            }
        }
    }

    // Helper method to check if the prompt contains club-related terms
    private boolean containsClubRelatedTerms(String lowerPrompt) {
        List<String> clubTerms = Arrays.asList(
                "club", "association", "group", "organization", "team",
                "member", "membership", "registration", "join", "signup",
                "activity", "event", "meeting", "gathering", "session",
                "sport", "art", "culture", "music", "technology", "science", "literature",
                "president", "secretary", "treasurer", "leader", "organizer", "creator", "founder",
                "clubsync", "participate", "register", "enroll"
        );

        return clubTerms.stream().anyMatch(lowerPrompt::contains);
    }

    // Helper method to extract category from the prompt
    private String extractCategory(String lowerPrompt) {
        List<String> categories = Arrays.asList("sport", "art", "culture", "music", "technology", "science", "literature", "other");
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
        if (description == null) return "Description not available";
        if (description.length() <= maxLength) return description;

        return description.substring(0, maxLength - 3)
                + "..."
                + (description.charAt(maxLength - 3) != ' ' ? " " : "");
    }

    private String getCategoryIcon(String category) {
        return switch (category.toLowerCase()) {
            case "sport" -> "⚽";
            case "music" -> "🎵";
            case "technology" -> "💻";
            case "science" -> "🔬";
            case "art" -> "🎨";
            case "literature" -> "📚";
            case "culture" -> "🎭";
            default -> "🔍";
        };
    }

    private String extractClubName(String prompt) {
        String promptLower = prompt.toLowerCase().replaceAll("[^a-z0-9]", " ");
        List<Club> allClubs = clubRepo.findAll();

        // Enhanced search logic
        Map<Club, Integer> matches = new LinkedHashMap<>();

        for (Club club : allClubs) {
            String cleanClubName = club.getName()
                    .toLowerCase()
                    .replaceAll("[^a-z0-9]", " ")
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
            return "No clubs found in the " + category + " category 🧐\n\nTry another category!";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(getCategoryIcon(category)).append(" **").append(category.toUpperCase()).append(" Clubs** ").append(getCategoryIcon(category)).append("\n\n");

        clubs.forEach(club -> {
            sb.append("🔹 **").append(club.getName()).append("** (").append(club.getMembers().size()).append(" members)\n")
                    .append("   _\"").append(club.getSlogan()).append("\"_\n")
                    .append("   📌 ").append(truncateDescription(club.getDescription(), 100)).append("\n\n");
        });

        sb.append("👉 For more details about a specific club, ask me for information about the club that interests you!");
        return sb.toString();
    }

    private String formatClubDetails(Club club) {
        StringBuilder sb = new StringBuilder();
        sb.append("🎯 **").append(club.getName()).append("**\n\n");
        sb.append("📝 *Description* :\n").append(club.getDescription()).append("\n\n");
        sb.append("🏷️ *Category* : ").append(getCategoryIcon(club.getCategorie())).append(" ").append(club.getCategorie()).append("\n");
        sb.append("💬 *Slogan* : \"").append(club.getSlogan()).append("\"\n");
        sb.append("👥 *Members* : ").append(club.getMembers().size()).append(" participants\n");
        if (club.getCreator() != null) {
            sb.append("👤 *Creator* : ").append(club.getCreator().getFirstname()).append(" ")
                    .append(club.getCreator().getLastname()).append("\n");
        }
        sb.append("\nℹ️ To join this club or get more information, log in to the ClubSync application or contact the club leaders directly.");
        return sb.toString();
    }

    @Override
    public String processFileUpload(MultipartFile file) {
        try {
            // Check if file is empty
            if (file.isEmpty()) {
                return "Empty file";
            }

            // Create upload directory if it doesn't exist
            String uploadDir = "uploads";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Save the file
            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            Path path = Paths.get(uploadDir + File.separator + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            // Process according to file type
            if (fileName != null) {
                String lowerFileName = fileName.toLowerCase();

                // Process PDFs
                if (lowerFileName.endsWith(".pdf")) {
                    if (lowerFileName.contains("club") || lowerFileName.contains("association")) {
                        return "📄 PDF file \"" + fileName + "\" uploaded successfully! If this document contains information about clubs, I can analyze it to help you.";
                    } else {
                        return "📄 PDF file \"" + fileName + "\" uploaded successfully! Note that I specialize in information about clubs. If you have questions about this, feel free to ask me.";
                    }
                }

                // Process images
                else if (contentType != null && contentType.startsWith("image/")) {
                    // Determine image type
                    String imageType = contentType.substring(6); // after "image/"
                    if (lowerFileName.contains("club") || lowerFileName.contains("event") || lowerFileName.contains("activity")) {
                        return "🖼️ Image \"" + fileName + "\" (" + imageType + ") uploaded successfully! If it contains information about clubs or their events, I'll do my best to help you.";
                    } else {
                        return "🖼️ Image \"" + fileName + "\" (" + imageType + ") uploaded successfully! For questions related to clubs, don't hesitate to ask me.";
                    }
                }

                // Word documents or others
                else if (lowerFileName.endsWith(".doc") || lowerFileName.endsWith(".docx")) {
                    return "📝 Document \"" + fileName + "\" uploaded successfully! If it contains information about clubs, feel free to ask me specific questions.";
                }
            }

            // Easter eggs and other special logic
            if (fileName != null &&
                    (fileName.toLowerCase().contains("easter"))) {
                return "🐰 Secret file discovered! 🥚 Happy Easter! The file \"" + fileName + "\" has been uploaded successfully.";
            }

            LocalDate today = LocalDate.now();
            if (today.getMonth() == Month.APRIL && today.getDayOfMonth() == 1) {
                return "File \"" + fileName + "\" uploaded successfully! 🎭 It's a special day today, isn't it? 😉";
            } else if (today.getMonth() == Month.APRIL) {
                return "File \"" + fileName + "\" uploaded successfully! 🥚";
            }

            // Default response
            return "✅ File \"" + fileName + "\" uploaded successfully! If you have any questions about clubs, I'm at your service.";
        } catch (Exception e) {
            return "❌ Error processing file: " + e.getMessage();
        }
    }
}