package tn.esprit.clubsync.Services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.TokenRepository;
import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.entities.Token;
import tn.esprit.clubsync.entities.User;

import java.security.Key;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${security.jwt.secret-key}")
    private String secretkey;

    @Value("${security.jwt.expiration}")
    private long jwtExpiration;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretkey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete any existing tokens for this user
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        // Prepare claims with all user information
        Map<String, Object> claims = new HashMap<>();

        // Ensure role is always uppercase in the token
        claims.put("role", user.getRole().getRoleType().name().toUpperCase());  // <-- Key change
        claims.put("idUser",user.getIdUser());
        claims.put("firstName", user.getLastname());
        claims.put("lastName", user.getFirstname());
        claims.put("email", user.getEmail());
        claims.put("birthDate", user.getDateNaissance() != null ?
                user.getDateNaissance().getTime() : null);
        claims.put("gender", user.getSexe() != null ? user.getSexe().name() : null);
        claims.put("phoneNumber", user.getNumeroDeTelephone());
        claims.put("profilePicture", user.getPhotoProfil());

        // Build JWT token
        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        // Create and save token entity
        Token newToken = Token.builder()
                .token(token)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusSeconds(jwtExpiration / 1000))
                .isValid(true)
                .user(user)
                .build();

        tokenRepository.save(newToken);
        return token;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, java.util.function.Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public void revokeToken(String token) {
        tokenRepository.findByToken(token).ifPresent(tokenRepository::delete);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
}
