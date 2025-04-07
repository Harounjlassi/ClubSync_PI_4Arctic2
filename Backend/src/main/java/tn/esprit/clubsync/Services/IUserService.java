package tn.esprit.clubsync.Services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.esprit.clubsync.entities.User;
import tn.esprit.clubsync.dtos.UserRequest;
import tn.esprit.clubsync.dtos.UserResponse;
import tn.esprit.clubsync.dtos.UserStatsResponse;

import java.util.List;

public interface IUserService {
    User updateUser(Long id, UserRequest updatedUser);
    void deleteUser(Long id);
     List<UserResponse> getAllUsers();
   User getUserById(Long id);
     void archiveUser(Long id);
    void restoreUser(Long id);
    List<UserResponse> filterByField(String field, String value);
    Page<UserResponse> getUsersSortedByPrenom(Pageable pageable);
    UserStatsResponse getUserStats();
    boolean isEmailTaken(String email);

}
