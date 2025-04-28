package tn.esprit.clubsync.Services;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.dtos.UserRequest;
import tn.esprit.clubsync.dtos.UserResponse;
import tn.esprit.clubsync.dtos.UserStatsResponse;
import tn.esprit.clubsync.entities.User;

import java.util.List;

@Service
@AllArgsConstructor
public class iUsersServiceImpl implements IUserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();

        }
    @Override
    public User getUserById(Long id) {
        System.out.println("Searching user by ID: " + id);
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Override
    public User updateUser(Long id, UserRequest updatedUser) {
        return null;
    }

    @Override
    public void deleteUser(Long id) {

    }

    @Override
    public void archiveUser(Long id) {

    }

    @Override
    public void restoreUser(Long id) {

    }

    @Override
    public List<UserResponse> filterByField(String field, String value) {
        return null;
    }

    @Override
    public Page<UserResponse> getUsersSortedByFirstName(Pageable pageable) {
        return null;
    }

    @Override
    public UserStatsResponse getUserStats() {
        return null;
    }

    @Override
    public boolean isEmailTaken(String email) {
        return false;
    }


}



    // Vos autres implémentations de méthodes existantes...
