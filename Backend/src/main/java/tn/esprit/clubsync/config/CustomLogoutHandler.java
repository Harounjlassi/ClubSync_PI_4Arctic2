package tn.esprit.clubsync.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import tn.esprit.clubsync.Repo.TokenRepo;
import tn.esprit.clubsync.entities.Token;

import org.springframework.security.web.authentication.logout.LogoutHandler;
@Configuration

public class CustomLogoutHandler  implements LogoutHandler {
    private final TokenRepo tokenRepository;

    public CustomLogoutHandler(TokenRepo tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @Override
    public void logout(HttpServletRequest request,
                       HttpServletResponse response,
                       Authentication authentication) {
        String authHeader = request.getHeader("Authorization");

        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }

        String token = authHeader.substring(7);
        Token storedToken = tokenRepository.findByAccessToken(token).orElse(null);

        if(storedToken != null) {
            storedToken.setLoggedOut(true);
            tokenRepository.save(storedToken);
        }
    }
}
