package tn.esprit.clubsync.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.iClubService;
import tn.esprit.clubsync.entities.Club;
import tn.esprit.clubsync.entities.Users;


import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/club")
@Tag(name = "Gestion des clubs" )
@CrossOrigin(origins = "http://localhost:4200") // Permet à Angular d'accéder au backend

public class ClubController  {
    @Autowired
    iClubService iClubservice;
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
    public Club addMemberToClub(@PathVariable("clubId") Long clubId, @PathVariable("userId") Long userId) {
        return iClubservice.addMemberToClub(clubId, userId);
    }

    // Supprimer un membre d'un club
    @Operation(description = "Supprimer un membre d'un club")
    @DeleteMapping("/{clubId}/removeMember/{userId}")
    public Club removeMemberFromClub(@PathVariable("clubId") Long clubId, @PathVariable("userId") Long userId) {
        return iClubservice.removeMemberFromClub(clubId, userId);
    }

    @Operation(description = "Récupérer tous les membres d'un club")
    @GetMapping("/{clubId}/members")
    public List<Users> getAllMembersByClubId(@PathVariable Long clubId) {
        return iClubservice.getAllMembersByClubId(clubId);
    }



}


