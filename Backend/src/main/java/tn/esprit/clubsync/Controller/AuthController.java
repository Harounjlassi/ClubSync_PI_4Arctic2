package tn.esprit.clubsync.Controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tn.esprit.clubsync.Repo.RoleRepository;
import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.Services.IUserService;
import tn.esprit.clubsync.Services.JwtService;
import tn.esprit.clubsync.dtos.GoogleLoginRequest;
import tn.esprit.clubsync.dtos.LoginRequest;
import tn.esprit.clubsync.dtos.UserRequest;
import tn.esprit.clubsync.dtos.VerifyRequest;
import tn.esprit.clubsync.entities.Role;
import tn.esprit.clubsync.entities.Sexe;
import tn.esprit.clubsync.entities.User;
import tn.esprit.clubsync.dtos.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/auth")
@SecurityRequirement(name = "BearerAuth")
@CrossOrigin(origins = {"http://localhost:5000", "http://localhost:4200"})
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

    @PostMapping(value = "/registration", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> saveUser(
            @RequestPart("userRequest") String userRequestJson,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        // 1. Parse JSON
        ObjectMapper mapper = new ObjectMapper();
        UserRequest userRequest;
        try {
            userRequest = mapper.readValue(userRequestJson, UserRequest.class);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(400).body("Invalid JSON format: " + e.getMessage());
        }

        System.out.println("POST request received on /auth/registration: " + userRequest.getEmail());

        // 2. Validate email
        if (userService.isEmailTaken(userRequest.getEmail())) {
            return ResponseEntity.status(400).body("Email already in use.");
        }

        // 3. Validate role ID
        if (userRequest.getId_role() == null) {
            return ResponseEntity.status(400).body("Role ID cannot be null.");
        }

        try {
            // 4. Fetch role
            Role userRole = roleRepository.findById(userRequest.getId_role())
                    .orElseThrow(() -> new RuntimeException("Role not found!"));

            // Handle photo upload (now null-safe)
            String imageUrl = null;
            if (photo != null && !photo.isEmpty()) {
                try {
                    String filename = photo.getOriginalFilename();
                    if (filename != null && !filename.isBlank()) {
                        imageUrl = savePhotoAndGetUrl(photo);
                    }
                } catch (IOException e) {
                    return ResponseEntity.status(500).body("Failed to process photo: " + e.getMessage());
                }
            }

            // 6. Create user entity
            User user = new User();
            user.setFirstname(userRequest.getFirstname());
            user.setLastname(userRequest.getLastname());
            user.setEmail(userRequest.getEmail());
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
            user.setDateNaissance(userRequest.getDateNaissance());
            user.setSexe(userRequest.getSexe());
            user.setNumeroDeTelephone(userRequest.getNumeroDeTelephone());
            user.setPhotoProfil(imageUrl);
            user.setRole(userRole);

            // 7. Save user
            userRepository.save(user);

            // 8. Send verification
            try {
                sendVerificationCode(user.getEmail());
            } catch (MessagingException e) {
                return ResponseEntity.status(500).body("User registered but failed to send verification: " + e.getMessage());
            }

            // 9. Return success
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully. Verification code sent.");
            response.put("email", user.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }


    // Helper methods
    private String savePhotoAndGetUrl(MultipartFile photo) throws IOException {
        String uploadDir = "uploads/";
        String filename = UUID.randomUUID() + "_" + photo.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, filename);

        Files.createDirectories(filePath.getParent());
        Files.write(filePath, photo.getBytes());

        return "http://localhost:8080/" + uploadDir + filename;
    }

    private User createUserFromRequest(UserRequest request, Role role, String photoUrl) {
        User user = new User();
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDateNaissance(request.getDateNaissance());
        user.setSexe(request.getSexe());
        user.setNumeroDeTelephone(request.getNumeroDeTelephone());
        user.setPhotoProfil(photoUrl);
        user.setRole(role);
        return user;
    }
    private final Map<String, VerificationData> verificationData = new ConcurrentHashMap<>();

    // For storing reset tokens - should be in a database for production
    private final Map<String, ResetTokenData> resetTokens = new ConcurrentHashMap<>();

    // Data class to store verification info
    private static class VerificationData {
        private final String code;
        private final LocalDateTime expiryTime;

        public VerificationData(String code) {
            this.code = code;
            // Set expiry to 10 minutes from now
            this.expiryTime = LocalDateTime.now().plusMinutes(10);
        }

        public boolean isValid(String code) {
            return this.code.equals(code) && LocalDateTime.now().isBefore(expiryTime);
        }
    }

    // Data class to store reset token info
    private static class ResetTokenData {
        private final String token;
        private final LocalDateTime expiryTime;

        public ResetTokenData(String token) {
            this.token = token;
            // Set token expiry to 1 hour
            this.expiryTime = LocalDateTime.now().plusHours(1);
        }

        public boolean isValid(String token) {
            return this.token.equals(token) && LocalDateTime.now().isBefore(expiryTime);
        }
    }

    // Step 1: User requests password reset
    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            // Check if email exists in your user database
            if (!userService.findByEmail(request.getEmail()).isPresent()) {
                // Don't reveal if email exists or not for security
                return ResponseEntity.ok(Map.of("message", "If your email exists, you will receive a verification code"));
            }

            sendVerificationCode(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "Verification code sent to your email"));
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send verification email"));
        }
    }

    // Step 2: User verifies code
    @PostMapping("/verify-code")
    public ResponseEntity<Object> verifyCode(@RequestBody VerifyCodeRequest request) {
        String email = request.getEmail();
        String code = request.getCode();

        VerificationData data = verificationData.get(email);
        if (data == null || !data.isValid(code)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid or expired verification code"));
        }

        // Generate a token to use for resetting password
        String resetToken = generateResetToken();
        // Store token with email
        resetTokens.put(email, new ResetTokenData(resetToken));

        return ResponseEntity.ok(Map.of("token", resetToken));
    }

    // Step 3: User resets password with token
    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@RequestBody ResetPasswordRequest request) {
        String email = request.getEmail();
        String token = request.getToken();
        String newPassword = request.getNewPassword();

        // Validate token
        ResetTokenData tokenData = resetTokens.get(email);
        if (tokenData == null || !tokenData.isValid(token)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid or expired reset token"));
        }

        // Get user and update password
        Optional<User> userOpt = userService.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        // Update password - your service should handle password encryption
        userService.updatePassword(userOpt.get(), newPassword);

        // Clean up - remove verification data and token
        verificationData.remove(email);
        resetTokens.remove(email);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    private void sendVerificationCode(String email) throws MessagingException {
        // Generate a 6-digit code
        String verificationCode = String.format("%06d", new Random().nextInt(1000000));
        sendEmail(email, verificationCode);
        // Store code with expiry
        verificationData.put(email, new VerificationData(verificationCode));
    }

    private void sendEmail(String to, String code) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject("Your ClubSync Password Reset Code");

        // Create a professional HTML email template
        String htmlContent =
                "<!DOCTYPE html>" +
                        "<html lang='en'>" +
                        "<head>" +
                        "    <meta charset='UTF-8'>" +
                        "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                        "    <title>Password Reset</title>" +
                        "    <style>" +
                        "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }" +
                        "        .container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                        "        .header { background-color: #3498db; padding: 20px; text-align: center; }" +
                        "        .header h1 { color: white; margin: 0; }" +
                        "        .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; }" +
                        "        .code-box { background-color: #fff; border: 1px solid #ddd; padding: 15px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; }" +
                        "        .footer { padding: 20px; text-align: center; font-size: 12px; color: #777; }" +
                        "        .button { display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; }" +
                        "    </style>" +
                        "</head>" +
                        "<body>" +
                        "    <div class='container'>" +
                        "        <div class='header'>" +
                        "            <h1>ClubSync</h1>" +
                        "        </div>" +
                        "        <div class='content'>" +
                        "            <h2>Password Reset Request</h2>" +
                        "            <p>Hello,</p>" +
                        "            <p>We received a request to reset your ClubSync account password. Please use the verification code below to complete your password reset:</p>" +
                        "            <div class='code-box'>" + code + "</div>" +
                        "            <p>This code will expire in <strong>10 minutes</strong>.</p>" +
                        "            <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.</p>" +
                        "            <p>Thank you,<br>The ClubSync Team</p>" +
                        "        </div>" +
                        "        <div class='footer'>" +
                        "            <p>This is an automated email. Please do not reply to this message.</p>" +
                        "            <p>&copy; " + java.time.Year.now().getValue() + " ClubSync. All rights reserved.</p>" +
                        "        </div>" +
                        "    </div>" +
                        "</body>" +
                        "</html>";

        helper.setText(htmlContent, true); // Set as HTML content
        mailSender.send(message);
    }

    private String generateResetToken() {
        // Generate a secure random token
        return UUID.randomUUID().toString();
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

            if (user.isArchived()) {
                return ResponseEntity.status(403).body("Account is banned. Contact admin.");
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
                    user.setLastname(nameParts[0]);
                    user.setFirstname(nameParts[1]);
                } else {
                    user.setLastname(name != null ? name : "");
                    user.setFirstname("");
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
            response.put("nom", user.getFirstname());
            response.put("prenom", user.getLastname());

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
            userInfo.put("idUser", user.getIdUser());
            userInfo.put("email", user.getEmail());
            userInfo.put("firstname", user.getFirstname());
            userInfo.put("lastname", user.getLastname());
            userInfo.put("dateNaissance", user.getDateNaissance());
            userInfo.put("sexe", user.getSexe().name());
            userInfo.put("numeroDeTelephone", user.getNumeroDeTelephone());
            userInfo.put("photoProfil", user.getPhotoProfil());
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

        // Return a JSON object instead of plain text
        Map<String, String> response = new HashMap<>();
        response.put("message", "User successfully logged out and token invalidated.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public String allAccess() {
        return "Public Content.";
    }

    @GetMapping("/USER")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> getUserContent() {
        return ResponseEntity.ok("User content");
    }

    @GetMapping("/ADMIN")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getAdminContent() {
        return ResponseEntity.ok("Admin content");
    }

    /*private void sendEmail(String to, String code) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Your Verification Code");
        helper.setText("Your verification code is: " + code);
        mailSender.send(message);
    }*/
    @PutMapping("/ban/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> banUser(@PathVariable Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = optionalUser.get();
        if (user.isArchived()) {
            return ResponseEntity.badRequest().body("User is already banned");
        }

        user.setArchived(true);
        userRepository.save(user);

        return ResponseEntity.ok("User banned successfully");
    }

    @PutMapping("/unban/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> unbanUser(@PathVariable Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = optionalUser.get();
        if (!user.isArchived()) {
            return ResponseEntity.badRequest().body("User is not banned");
        }

        user.setArchived(false);
        userRepository.save(user);

        return ResponseEntity.ok("User unbanned successfully");
    }
    @PostMapping("/face-login")
    public ResponseEntity<Object> loginWithFace(
            @RequestParam("image") MultipartFile imageFile,
            @RequestParam("email") String email) {
        try {
            // First check if the user exists in the database
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found in database"));
            }

            User user = userOptional.get();

            if (user.isArchived()) {
                return ResponseEntity.status(403).body(Map.of("error", "Account is banned. Contact admin."));
            }

            // Now call the Flask API with both the image and email for verification
            String flaskApiUrl = "http://localhost:5000/recognize";

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new MultipartFileResource(imageFile));
            body.add("email", email); // Send email to Flask API to verify the specific user

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(flaskApiUrl, HttpMethod.POST, requestEntity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // Check if the face matches the specific user
                if (response.getBody().containsKey("success") && (Boolean)response.getBody().get("success")) {
                    // Generate JWT token for the recognized user
                    UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                            .username(user.getEmail())
                            .password(user.getPassword())
                            .roles(user.getRole().getRoleType().name())
                            .build();

                    String token = jwtService.generateToken(userDetails);

                    Map<String, Object> loginResponse = new HashMap<>();
                    loginResponse.put("message", "Face recognition successful!");
                    loginResponse.put("token", token);
                    loginResponse.put("role", user.getRole().getRoleType());
                    loginResponse.put("email", user.getEmail());
                    loginResponse.put("nom", user.getFirstname());
                    loginResponse.put("prenom", user.getLastname());

                    return ResponseEntity.ok(loginResponse);
                } else {
                    // Get the error message from the response if available
                    String errorMsg = "Face recognition failed";
                    if (response.getBody().containsKey("error")) {
                        errorMsg = (String) response.getBody().get("error");
                    }
                    return ResponseEntity.status(401).body(Map.of("error", errorMsg));
                }
            } else {
                return ResponseEntity.status(response.getStatusCode())
                        .body(Map.of("error", "Face recognition service returned an error"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error: " + e.getMessage()));
        }
    }
    @PostMapping("/upload-profile-image")
    public ResponseEntity<String> uploadImage(@RequestParam("image") MultipartFile file) throws IOException {
        String uploadDir = "uploads/";
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + filename);

        Files.createDirectories(filePath.getParent());
        Files.write(filePath, file.getBytes());

        // Return relative path instead of full URL
        String imagePath = "/" + uploadDir + filename;
        return ResponseEntity.ok(imagePath);
    }
    // Add this endpoint to check if a user has enrolled their face
    @GetMapping("/check-face-enrollment/{email}")
    public ResponseEntity<Map<String, Object>> checkFaceEnrollment(@PathVariable String email) {
        try {
            // First check if the user exists in the database
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("enrolled", false, "message", "User not found"));
            }

            // Call the Flask API to check if face is enrolled
            String flaskApiUrl = "http://localhost:5000/check-enrollment";

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("email", email);

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    flaskApiUrl, HttpMethod.POST, requestEntity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                boolean enrolled = response.getBody().containsKey("enrolled") &&
                        (Boolean)response.getBody().get("enrolled");

                return ResponseEntity.ok(Map.of(
                        "enrolled", enrolled,
                        "message", enrolled ? "Face is enrolled" : "Face not enrolled"
                ));
            } else {
                return ResponseEntity.status(response.getStatusCode())
                        .body(Map.of("enrolled", false, "message", "Failed to check enrollment status"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("enrolled", false, "message", "Internal Server Error: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/register-with-face", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> registerWithFace(
            @RequestParam("image") MultipartFile imageFile,
            @RequestParam("email") String email) {

        try {
            // 1. Find user
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "error", "User not found",
                                "email", email
                        ));
            }

            User user = userOptional.get();

            // 2. Validate image
            if (imageFile.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Image file cannot be empty");
            }

            // 3. Save image to server and get URL
            String imageUrl;
            try {
                String uploadDir = "uploads/faces/";
                String filename = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
                Path imagePath = Paths.get(uploadDir + filename);

                Files.createDirectories(imagePath.getParent());
                Files.copy(imageFile.getInputStream(), imagePath, StandardCopyOption.REPLACE_EXISTING);

                imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/" + uploadDir + filename)
                        .toUriString();

                user.setPhotoProfil(imageUrl); // Store URL instead of BLOB
                userRepository.save(user);

            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to save image: " + e.getMessage());
            }

            // 4. Register with Flask face recognition
            String flaskApiUrl = "http://localhost:5000/register";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new MultipartFileResource(imageFile));
            body.add("email", email);

            ResponseEntity<Map> response = new RestTemplate().exchange(
                    flaskApiUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            // 5. Handle response
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("email", email);
            responseBody.put("imageUrl", imageUrl);

            if (response.getStatusCode() == HttpStatus.OK &&
                    response.getBody() != null &&
                    Boolean.TRUE.equals(response.getBody().get("success"))) {

                responseBody.put("message", "Face registered successfully");
                responseBody.put("success", true);
                return ResponseEntity.ok(responseBody);

            } else {
                String errorMsg = response.getBody() != null && response.getBody().containsKey("error")
                        ? (String) response.getBody().get("error")
                        : "Face registration service error";

                responseBody.put("error", errorMsg);
                responseBody.put("success", false);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Internal server error",
                            "details", e.getMessage(),
                            "email", email
                    ));
        }
    }


    // Add a new endpoint to sync faces from your database to the face recognition system
    @PostMapping("/sync-faces")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> syncFaces() {
        try {
            String flaskApiUrl = "http://localhost:5000/sync-faces";
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.getForEntity(flaskApiUrl, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            } else {
                return ResponseEntity.status(response.getStatusCode()).body("Failed to sync faces with face recognition service");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }
}


