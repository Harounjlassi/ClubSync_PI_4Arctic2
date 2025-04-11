package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.ProjetTache;
import tn.esprit.clubsync.entities.Users;

import java.util.List;

public interface iUsersService {
    public List<Users> searchUserByUsername(String title);
    public List<Users> findUsers();
    public List<Users> searchUserById(Long id) ;
    }