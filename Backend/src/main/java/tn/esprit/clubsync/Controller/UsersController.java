package tn.esprit.clubsync.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.iUsersService;
import tn.esprit.clubsync.entities.Users;

import java.util.List;

@RestController
@RequestMapping("/user")
@AllArgsConstructor
@Tag(name = "Gestion des utilisateurs")
@CrossOrigin(origins = "http://localhost:4200") // Pour permettre l'accès depuis Angular
public class UsersController {

    @Autowired
    private iUsersService iUsersService;

    @Operation(description = "Récupérer tous les utilisateurs")
    @GetMapping("/allUsers")
    public List<Users> getAllUsers() {
        return iUsersService.getAllUsers();
    }

    @GetMapping("/retrieveUser/{id}")
    public Users getUserById(@PathVariable("id") Long id) {
        System.out.println("Received request for user ID: " + id);
        return iUsersService.getUserById(id);
    }

    // Vos autres méthodes de contrôleur existantes...
}
