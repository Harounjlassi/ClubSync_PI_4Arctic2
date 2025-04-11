package tn.esprit.clubsync.Services;

import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.TacheRepository;
import tn.esprit.clubsync.Repo.UserRepo;
import tn.esprit.clubsync.entities.ProjetTache;
import tn.esprit.clubsync.entities.Users;

import java.util.List;

@Service
public class UsersServiceImpl implements iUsersService {


    private final UserRepo userRepository;

    // Constructor injection is recommended
    public UsersServiceImpl(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<Users> searchUserByUsername(String title) {
        return userRepository.searchUserByUsername(title);
    }

    @Override
    public List<Users> searchUserById(Long id) {
        return userRepository.findUserById(id);
    }

    @Override
    public List<Users> findUsers() {
        return userRepository.findAll();
    }
}
