package tn.esprit.clubsync.Controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.clubsync.Repo.RoleRepository;
import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.Services.IUserService;
import tn.esprit.clubsync.Services.JwtService;
import tn.esprit.clubsync.dtos.UserRequest;
import tn.esprit.clubsync.dtos.UserResponse;
import tn.esprit.clubsync.dtos.UserStatsResponse;
import tn.esprit.clubsync.entities.Role;
import tn.esprit.clubsync.entities.User;


import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
@SecurityRequirement(name = "BearerAuth")
@CrossOrigin(origins = "http://localhost:4200") // Pour permettre l'accès depuis Angular
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private IUserService iUsersService, userService;




    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
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

        // 2. Validate user exists
        User existingUser = userRepository.findById(id)
                .orElse(null);
        if (existingUser == null) {
            return ResponseEntity.status(404).body("User not found with ID: " + id);
        }

        // 3. Validate email if changed
        if (!existingUser.getEmail().equals(userRequest.getEmail()) &&
                userService.isEmailTaken(userRequest.getEmail())) {
            return ResponseEntity.status(400).body("Email already in use.");
        }

        try {
            // 4. Handle photo upload if provided
            String imageUrl = existingUser.getPhotoProfil(); // Keep existing photo by default
            if (photo != null && !photo.isEmpty()) {
                try {
                    String filename = photo.getOriginalFilename();
                    if (filename != null && !filename.isBlank()) {
                        imageUrl = savePhotoAndGetUrl(photo);

                        // Delete old photo if it exists
                        if (existingUser.getPhotoProfil() != null && !existingUser.getPhotoProfil().isEmpty()) {
                            // Implement deleteOldPhoto method based on your storage system
                            // deleteOldPhoto(existingUser.getPhotoProfil());
                        }
                    }
                } catch (IOException e) {
                    return ResponseEntity.status(500).body("Failed to process photo: " + e.getMessage());
                }
            }

            // 5. Update role if provided
            Role userRole = existingUser.getRole(); // Default to current role
            if (userRequest.getId_role() != null) {
                userRole = roleRepository.findById(userRequest.getId_role())
                        .orElseThrow(() -> new RuntimeException("Role not found!"));
            }

            // 6. Update user entity
            existingUser.setFirstname(userRequest.getFirstname());
            existingUser.setLastname(userRequest.getLastname());
            existingUser.setEmail(userRequest.getEmail());

            // Only update password if provided
            if (userRequest.getPassword() != null && !userRequest.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(userRequest.getPassword()));
            }

            existingUser.setDateNaissance(userRequest.getDateNaissance());
            existingUser.setSexe(userRequest.getSexe());
            existingUser.setNumeroDeTelephone(userRequest.getNumeroDeTelephone());
            existingUser.setPhotoProfil(imageUrl);
            existingUser.setRole(userRole);

            // 7. Save updated user
            User updatedUser = userRepository.save(existingUser);

            // 8. Return success with updated user data
            return ResponseEntity.ok(userService.convertToUserResponse(updatedUser));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Update failed: " + e.getMessage());
        }
    }

    // Assuming you have a method like this in your service
    private String savePhotoAndGetUrl(MultipartFile photo) throws IOException {
        // Implementation depends on your storage system (local disk, cloud storage, etc.)
        // This is just a placeholder
        String fileName = UUID.randomUUID() + "_" + photo.getOriginalFilename();
        String uploadDir = "uploads/";
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        try (InputStream inputStream = photo.getInputStream()) {
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + fileName; // Return relative URL path
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted");
    }

    @GetMapping("/get/all")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> responses = users.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(responses);
    }

    private UserResponse convertToResponse(User user) {
        return UserResponse.builder()
                .idUser(user.getIdUser())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .dateNaissance(user.getDateNaissance())
                .sexe(user.getSexe())
                .numeroDeTelephone(user.getNumeroDeTelephone())
                .photoProfil(user.getPhotoProfil())
                .role(user.getRole() != null ?
                        Collections.singletonList(user.getRole().getRoleType().name()) :
                        Collections.emptyList())
                .build();
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    @Operation(summary = "Archiver un utilisateur")
    @PutMapping("/archive/{idUser}")
    public void archiveUser(@PathVariable Long idUser) {
        userService.archiveUser(idUser);
    }
    @PutMapping("/restore/{id}")
    public ResponseEntity<String> restoreUser(@PathVariable Long id) {
        userService.restoreUser(id);
        return ResponseEntity.ok("Utilisateur restauré avec succès");
    }

    @GetMapping("/filter")
    public ResponseEntity<List<UserResponse>> filterByField(
            @RequestParam String field,
            @RequestParam String value) {
        return ResponseEntity.ok(userService.filterByField(field, value));
    }
    @GetMapping("/users/sorted")
    public ResponseEntity<Page<UserResponse>> getUsersSortedByFirstName(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("firstname").ascending());
        return ResponseEntity.ok(userService.getUsersSortedByFirstName(pageable));
    }
    @GetMapping("/users/stats")
    public ResponseEntity<UserStatsResponse> getUserStats() {
        return ResponseEntity.ok(userService.getUserStats());
    }
    @GetMapping("/users/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.isEmailTaken(email);
        return ResponseEntity.ok(Collections.singletonMap("taken", exists));
    }
    @GetMapping("/searchUserByUsername/{username}")
    public ResponseEntity<List<User>> searchUserByUsername(@PathVariable String username) {
        List<User> existingTaches = userService.searchUserByUsername(username);
        return ResponseEntity.ok(existingTaches);
    }
}
