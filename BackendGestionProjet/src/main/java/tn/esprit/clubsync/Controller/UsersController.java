package tn.esprit.clubsync.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.TacheServiceImpl;
import tn.esprit.clubsync.Services.UsersServiceImpl;
import tn.esprit.clubsync.entities.ProjetTache;
import tn.esprit.clubsync.entities.Users;

import java.util.List;


@RestController
@RequestMapping("users")
@CrossOrigin(origins = "http://localhost:4200")
public class UsersController {

    private final UsersServiceImpl userService;

    public UsersController(UsersServiceImpl userService) {
        this.userService = userService;
    }

    @GetMapping("/all")
    public List<Users> getAllUsers() {
        return userService.findUsers();
    }


    @GetMapping("/searchUserByUsername/{username}")
    public ResponseEntity<List<Users>> searchUserByUsername(@PathVariable String username) {
        List<Users> existingTaches = userService.searchUserByUsername(username);
        return ResponseEntity.ok(existingTaches);
    }
    @GetMapping("/getUserById/{id}")
    public ResponseEntity<List<Users>> getUserById(@PathVariable Long id) {
        List<Users> existingTaches = userService.searchUserById(id);
        return ResponseEntity.ok(existingTaches);
    }
}
