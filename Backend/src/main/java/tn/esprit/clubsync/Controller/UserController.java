package tn.esprit.clubsync.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Repo.RoleRepository;
import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.Services.IUserService;
import tn.esprit.clubsync.dtos.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@SecurityRequirement(name = "BearerAuth")
@CrossOrigin(origins = "http://localhost:4200") // Permet à Angular d'accéder au backend
public class UserController {


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private IUserService userService;

    /// ///////////////CRUD : delete , update , get User
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(userService.updateUser(id, userRequest));
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted");
    }

    @GetMapping("/get/all")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
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
    public ResponseEntity<Page<UserResponse>> getUsersSortedByPrenom(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("prenom").ascending());
        return ResponseEntity.ok(userService.getUsersSortedByPrenom(pageable));
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

}
