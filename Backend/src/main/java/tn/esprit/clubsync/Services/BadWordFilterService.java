package tn.esprit.clubsync.Services;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class BadWordFilterService {

    private static final List<String> BAD_WORDS = Arrays.asList(
            "merde", "con", "idiot", "putain", "stupide"
    );

    public boolean containsBadWords(String text) {
        if (text == null) return false;
        String lowerText = text.toLowerCase();
        return BAD_WORDS.stream().anyMatch(lowerText::contains);
    }

    public String cleanBadWords(String text) {
        if (text == null) return null;
        String result = text;
        for (String badWord : BAD_WORDS) {
            result = result.replaceAll("(?i)" + badWord, "***");
        }
        return result;
    }
}
