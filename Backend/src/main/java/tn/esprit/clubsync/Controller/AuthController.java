package tn.esprit.clubsync.Controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.entities.Role;
import tn.esprit.clubsync.entities.Sexe;
import tn.esprit.clubsync.entities.User;
import tn.esprit.clubsync.Repo.RoleRepository;
import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.Services.IUserService;
import tn.esprit.clubsync.Services.JwtService;
import tn.esprit.clubsync.dtos.*;

import java.util.*;

@RestController
@RequestMapping("/auth")
@SecurityRequirement(name = "BearerAuth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    private final Map<String, String> verificationCodes = new HashMap<>();
    private static final String CLIENT_ID = "376533833455-qgcjilh1un1k0cfunakdab8b328a0p9f.apps.googleusercontent.com";

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private IUserService userService;

    @PostMapping("/registration")
    public ResponseEntity<Object> saveUser(@RequestBody UserRequest userRequest) {
        System.out.println("Requête POST reçue sur /auth/registration : " + userRequest.getEmail());

        if (userService.isEmailTaken(userRequest.getEmail())) {
            return ResponseEntity.status(400).body("Email already in use.");
        }

        Role userRole = roleRepository.findById(userRequest.getId_role())
                .orElseThrow(() -> new RuntimeException("Role not found!"));

        User user = new User();
        user.setNom(userRequest.getNom());
        user.setPrenom(userRequest.getPrenom());
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setDateNaissance(userRequest.getDateNaissance());
        user.setSexe(userRequest.getSexe());
        user.setNumeroDeTelephone(userRequest.getNumeroDeTelephone());
        user.setPhotoProfil(userRequest.getPhotoProfil());
        user.setRole(userRole);

        userRepository.save(user);

        String verificationCode = String.format("%06d", new Random().nextInt(999999));
        try {
            sendEmail(user.getEmail(), verificationCode);
            verificationCodes.put(user.getEmail(), verificationCode);
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("User registered, but failed to send verification code.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully. Verification code sent.");
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Object> verifyCode(@RequestBody VerifyRequest request) {
        return ResponseEntity.status(200).body(verificationCodes.get(request.getCode()));
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest loginRequest) {
        try {
            Optional<User> optionalUser = userRepository.findByEmail(loginRequest.getEmail());

            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid credentials: User not found");
            }

            User user = optionalUser.get();

            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.status(401).body("Invalid credentials: Incorrect password");
            }

            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole().getRoleType().name())
                    .build();

            String token = jwtService.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login Successful!");
            response.put("token", token);
            response.put("role", user.getRole().getRoleType());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    @PostMapping("/google")
    public ResponseEntity<Object> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new JacksonFactory())
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                return ResponseEntity.status(401).body("Invalid Google token");
            }

            Payload payload = idToken.getPayload();
            String email = payload.getEmail();

            Optional<User> optionalUser = userRepository.findByEmail(email);
            User user;

            if (optionalUser.isEmpty()) {
                user = new User();
                String name = (String) payload.get("name");

                if (name != null && name.contains(" ")) {
                    String[] nameParts = name.split(" ", 2);
                    user.setPrenom(nameParts[0]);
                    user.setNom(nameParts[1]);
                } else {
                    user.setPrenom(name != null ? name : "");
                    user.setNom("");
                }

                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setSexe(Sexe.Homme); // Default value
                user.setNumeroDeTelephone(0); // Default value
                user.setPhotoProfil(null); // Explicitly set to null
                user.setDateNaissance(new Date()); // Default to current date or set null if allowed

                Role userRole = roleRepository.findById(2)
                        .orElseThrow(() -> new RuntimeException("Default role not found!"));
                user.setRole(userRole);

                userRepository.save(user);
            } else {
                user = optionalUser.get();
            }

            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole().getRoleType().name())
                    .build();

            String token = jwtService.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Google authentication successful!");
            response.put("token", token);
            response.put("role", user.getRole().getRoleType());
            response.put("email", user.getEmail());
            response.put("nom", user.getNom());
            response.put("prenom", user.getPrenom());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Object> getUserInfo(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            String email = jwtService.extractUsername(token);
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body("Utilisateur non trouvé");
            }

            User user = userOptional.get();
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("email", user.getEmail());
            userInfo.put("nom", user.getNom());
            userInfo.put("prenom", user.getPrenom());
            userInfo.put("role", user.getRole().getRoleType());

            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Token invalide ou expiré");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Object> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(400).body("Invalid token format");
        }

        String token = authHeader.substring(7);
        jwtService.revokeToken(token);

        return ResponseEntity.ok("User successfully logged out and token invalidated.");
    }

    @GetMapping("/all")
    public String allAccess() {
        return "Public Content.";
    }

    @GetMapping("/User")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> getUserContent() {
        return ResponseEntity.ok("User content");
    }

    @GetMapping("/Admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getAdminContent() {
        return ResponseEntity.ok("Admin content");
    }

    private void sendEmail(String to, String code) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Your Verification Code");
        helper.setText("Your verification code is: " + code);
        mailSender.send(message);
    }
}