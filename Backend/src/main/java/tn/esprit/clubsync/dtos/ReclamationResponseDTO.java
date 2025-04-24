package tn.esprit.clubsync.dtos;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReclamationResponseDTO {
    private Integer id;
    private String nomUtilisateur;
    private String typeReclamation;
    private String description;
    private Date dateReclamation;
    private String statut;





}