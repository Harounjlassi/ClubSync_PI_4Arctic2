package tn.esprit.clubsync.Mapper;

import org.springframework.stereotype.Component;
import tn.esprit.clubsync.dtos.UserResponse;
import tn.esprit.clubsync.entities.User;

import java.util.Base64;
import java.util.Collections;

@Component
public class UserMapper {

    public UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();

        response.setIdUser(user.getIdUser());
        response.setFirstname(user.getFirstname());
        response.setLastname(user.getLastname());
        response.setEmail(user.getEmail());
        response.setDateNaissance(user.getDateNaissance());
        response.setSexe(user.getSexe());
        response.setNumeroDeTelephone(user.getNumeroDeTelephone());
        response.setPhotoProfil(user.getPhotoProfil()); // Utiliser la version String
        response.setRole(Collections.singletonList(user.getRole().getRoleType().toString()));

        return response;
    }
}
