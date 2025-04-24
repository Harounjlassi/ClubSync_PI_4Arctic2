package tn.esprit.clubsync.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.iClubRecommendationService;
import tn.esprit.clubsync.Services.iClubService;
import tn.esprit.clubsync.entities.Club;
import tn.esprit.clubsync.entities.User;
import tn.esprit.clubsync.Services.IUserService;



import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/club")
@Tag(name = "Gestion des clubs" )
@CrossOrigin(origins = "http://localhost:4200") // Permet à Angular d'accéder au backend

public class ClubController  {
    @Autowired
    iClubService iClubservice;


    @Autowired
    private IUserService iUsersService;

    @Autowired
    private iClubRecommendationService recommendationService;

    @Operation(description = "Affichage de toutes les clubs")

    @GetMapping("/retrieveAllClub")
    public List<Club> afficherClub(){
        return iClubservice.retrieveAllClub();
    }


    @Operation(description = "Affichage d'un club selon l'ID")

    @GetMapping("/retrieveClub/{id}")
    public Club afficheClub(@PathVariable("id") long id_club ){
        return iClubservice.retrieveClub(id_club);
    }

    @PostMapping("/AddClub")
    public Club ajouterclub(@RequestBody Club club){
        return iClubservice.addClub(club);
    }

    @PutMapping("/updateClub")
    public Club updateClub(@RequestBody Club club){
        return iClubservice.updateClub(club);
    }

    @DeleteMapping("/deleteClub/{id}")
    public void deleteClub(@PathVariable("id") long id_club){
        iClubservice.deleteClub(id_club);
    }

    // Ajouter un membre à un club
    @Operation(description = "Ajouter un membre à un club")
    @PostMapping("/{clubId}/addMember/{userId}")
    public ResponseEntity<?> addMemberToClub(@PathVariable("clubId") Long clubId, @PathVariable("userId") Long userId) {
        try {
            // Vérifier si l'utilisateur est déjà membre du club
            Club club = iClubservice.retrieveClub(clubId);
            if (club.getMembers() != null &&
                    club.getMembers().stream().anyMatch(member -> member.getIdUser() == userId)) {
                return ResponseEntity.badRequest().body("L'utilisateur est déjà membre de ce club");
            }

            // Si l'utilisateur n'est pas membre, l'ajouter
            Club updatedClub = iClubservice.addMemberToClub(clubId, userId);
            return ResponseEntity.ok(updatedClub);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'ajout du membre: " + e.getMessage());
        }
    }

    // Supprimer un membre d'un club
    @Operation(description = "Supprimer un membre d'un club")
    @DeleteMapping("/{clubId}/removeMember/{userId}")
    public Club removeMemberFromClub(@PathVariable("clubId") Long clubId, @PathVariable("userId") Long userId) {
        return iClubservice.removeMemberFromClub(clubId, userId);
    }

    @Operation(description = "Récupérer tous les membres d'un club")
    @GetMapping("/{clubId}/members")
    public List<User> getAllMembersByClubId(@PathVariable Long clubId) {
        return iClubservice.getAllMembersByClubId(clubId);
    }

    // Nouvel endpoint pour les recommandations
    @Operation(description = "Recommander des clubs à un utilisateur basé sur ses inscriptions existantes")
    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<List<Club>> getRecommendationsForUser(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "max", defaultValue = "3") int maxRecommendations) {

        List<Club> recommendations = recommendationService.recommendClubsByCategory(userId, maxRecommendations);

        if (recommendations.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(recommendations);
    }







}


