package tn.esprit.clubsync.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.esprit.clubsync.dtos.UserRequest;
import tn.esprit.clubsync.dtos.UserResponse;
import tn.esprit.clubsync.dtos.UserStatsResponse;
import tn.esprit.clubsync.entities.User;

public interface IUserService {
    public List<User> getAllUsers();

    public User getUserById(Long id);

    User updateUser(Long id, UserRequest updatedUser);
    void deleteUser(Long id);

    void archiveUser(Long id);
    void restoreUser(Long id);
    List<UserResponse> filterByField(String field, String value);

    Page<UserResponse> getUsersSortedByFirstName(Pageable pageable);
    UserStatsResponse getUserStats();
    boolean isEmailTaken(String email);

    UserResponse convertToUserResponse(User user);
    /**
     * Update a user's password
     * @param user The user entity
     * @param newPassword The new password (plain text, service should encrypt)
     */
    void updatePassword(User user, String newPassword);
    /**
     * Find a user by their email address
     * @param email The user's email
     * @return Optional containing the user if found, empty otherwise
     */
    Optional<User> findByEmail(String email);

    List<User> searchUserByUsername(String title) ;

    List<User> searchUserById(Long id);
    // Vos autres méthodes de service existantes...
}
