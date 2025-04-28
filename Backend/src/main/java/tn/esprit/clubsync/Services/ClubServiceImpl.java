package tn.esprit.clubsync.Services;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.ClubRepo;

import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.entities.Club;
import tn.esprit.clubsync.entities.User;

import java.util.List;

@Service
@AllArgsConstructor
@Transactional

public class ClubServiceImpl implements iClubService {

    @Autowired
    ClubRepo ClubRepo;

    @Autowired
    private UserRepository userRepo;


    @Override
    public List<Club> retrieveAllClub() {
        return ClubRepo.findAll();
    }

    @Override
    public Club retrieveClub(long id) {
        return ClubRepo.findById(id).get();
    }

    @Override
    public Club addClub(Club club) {
        // Vérifie si un créateur est spécifié dans le club
        if (club.getCreator() != null && club.getCreator().getIdUser() != 0)
        {
            User creator = userRepo.findById(club.getCreator().getIdUser()).orElseThrow(() ->
                    new RuntimeException("Creator with ID " + club.getCreator().getIdUser() + " not found"));
            club.setCreator(creator);
        }
        return ClubRepo.save(club); // Sauvegarde le club avec le créateur associé
    }
    @Override
    public Club updateClub(Club Club) {
        return ClubRepo.save(Club);
    }

    @Override
    public void deleteClub(long id) {
        ClubRepo.deleteById(id);
    }

    // Implémentation de la méthode pour ajouter un membre au club
    @Override
    public Club addMemberToClub(Long clubId, Long userId) {
        // Trouver le club par son ID
        Club club = ClubRepo.findById(clubId).orElseThrow(() ->
                new RuntimeException("Club with ID " + clubId + " not found"));

        // Trouver l'utilisateur par son ID
        User user = userRepo.findById(userId).orElseThrow(() ->
                new RuntimeException("User with ID " + userId + " not found"));

        // Ajouter l'utilisateur à la liste des membres du club
        club.getMembers().add(user);



        // Sauvegarder les modifications du club
        return ClubRepo.save(club);
    }

    // Implémentation de la méthode pour supprimer un membre du club
    @Override
    public Club removeMemberFromClub(Long clubId, Long userId) {
        // Trouver le club par son ID
        Club club = ClubRepo.findById(clubId).orElseThrow(() ->
                new RuntimeException("Club with ID " + clubId + " not found"));

        // Trouver l'utilisateur par son ID
        User user = userRepo.findById(userId).orElseThrow(() ->
                new RuntimeException("User with ID " + userId + " not found"));

        // Supprimer l'utilisateur de la liste des membres du club
        club.getMembers().remove(user);

        // Sauvegarder les modifications du club
        return ClubRepo.save(club);
    }

    @Override
    public List<User> getAllMembersByClubId(Long clubId) {
        Club club = ClubRepo.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club non trouvé"));
        return club.getMembers(); // Retourne la liste des membres
    }

    @Override
    public List<Club> getClubsByUserId(Long userId) {
        return ClubRepo.findClubsByUserId(userId);
    }


}
