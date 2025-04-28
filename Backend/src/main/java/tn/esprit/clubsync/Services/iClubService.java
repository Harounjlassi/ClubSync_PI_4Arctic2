package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.Club;
import tn.esprit.clubsync.entities.User;

import java.util.List;

public interface iClubService {
    public List<Club> retrieveAllClub();
    public Club retrieveClub(long id_club);
    public Club addClub(Club Club);
    public Club updateClub(Club Club);
    public void deleteClub(long id_club);

    // Ajouter un membre à un club
    public Club addMemberToClub(Long clubId, Long userId);

    // Supprimer un membre d'un club
    public Club removeMemberFromClub(Long clubId, Long userId);

    public  List<User> getAllMembersByClubId(Long clubId);

    List<Club> getClubsByUserId(Long userId); // Ajoutez cette ligne
}




