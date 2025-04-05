package tn.esprit.clubsync.Services;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.UserRepo;
import tn.esprit.clubsync.entities.Users;

import java.util.List;

@Service
@AllArgsConstructor
public class iUsersServiceImpl implements iUsersService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public List<Users> getAllUsers() {
        return userRepo.findAll();

        }
    @Override
    public Users getUserById(Long id) {
        System.out.println("Searching user by ID: " + id);
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }


}



    // Vos autres implémentations de méthodes existantes...
