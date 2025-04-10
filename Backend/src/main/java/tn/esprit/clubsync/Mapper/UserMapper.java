package tn.esprit.clubsync.Mapper;

import org.springframework.stereotype.Component;
import tn.esprit.clubsync.entities.User;
import tn.esprit.clubsync.dtos.UserResponse;

import java.util.Collections;

@Component
public class UserMapper {

    public UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();

        response.setIdUser(user.getIdUser());
        response.setNom(user.getNom());
        response.setPrenom(user.getPrenom());
        response.setEmail(user.getEmail());
        response.setDateNaissance(user.getDateNaissance());
        response.setSexe(user.getSexe());
        response.setNumeroDeTelephone(user.getNumeroDeTelephone());
        response.setPhotoProfil(user.getPhotoProfil());
        response.setRole(Collections.singletonList(user.getRole().getRoleType().toString()));

        return response;
    }
}
