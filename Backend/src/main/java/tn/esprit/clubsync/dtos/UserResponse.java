package tn.esprit.clubsync.dtos;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tn.esprit.clubsync.entities.Sexe;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private long idUser;
    private String nom;
    private String prenom;
    private String email;
    private Date dateNaissance;
    private Sexe sexe;
    private Integer numeroDeTelephone;
    private String photoProfil;
    private List<String> role;
}

