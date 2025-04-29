package tn.esprit.clubsync.Services;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.dtos.UserRequest;
import tn.esprit.clubsync.dtos.UserResponse;
import tn.esprit.clubsync.dtos.UserStatsResponse;
import tn.esprit.clubsync.entities.User;
import org.springframework.security.core.GrantedAuthority;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class iUsersServiceImpl implements IUserService {
    @Autowired
    private PasswordEncoder passwordEncoder;

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
    @Override
    public UserResponse convertToUserResponse(User user) {
        List<String> roles = user.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return UserResponse.builder()
                .idUser(user.getIdUser())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .dateNaissance(user.getDateNaissance())
                .sexe(user.getSexe())
                .numeroDeTelephone(user.getNumeroDeTelephone())
                .photoProfil(user.getPhotoProfil())
                .role(roles)
                .build();
    }

    @Override
    public void updatePassword(User user, String newPassword) {


        // Encode the new password
        String encodedPassword = passwordEncoder.encode(newPassword);

        // Update the user's password
        user.setPassword(encodedPassword);

        // Save the updated user to the database
        userRepository.save(user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> searchUserByUsername(String title) {
        return userRepository.searchUserByUsername(title);
    }
    @Override
    public List<User> searchUserById(Long id) {
        return userRepository.findUserById(id);
    }
}



// Vos autres implémentations de méthodes existantes...
