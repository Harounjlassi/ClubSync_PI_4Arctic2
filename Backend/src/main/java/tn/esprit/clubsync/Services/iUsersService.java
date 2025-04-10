package tn.esprit.clubsync.Services;

import java.util.List;
import tn.esprit.clubsync.entities.Users;

public interface iUsersService {
    public List<Users> getAllUsers();

    public Users getUserById(Long id);





    // Vos autres méthodes de service existantes...
}
