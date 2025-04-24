package tn.esprit.clubsync.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class ReclamationResponse {
    private Long id;
    private String type;
    private String description;
    private String statut;
    private Date dateReclamation;
    private Date dateResolution;
    private String nomNuser;
    private String nomAdmin;

    public ReclamationResponse(Integer idReclamation, String type, String description, String statut, Date dateReclamation, Date dateResolution) {
        this.id = idReclamation != null ? Long.valueOf(idReclamation) : null;
        this.type = type;
        this.description = description;
        this.statut = statut;
        this.dateReclamation = dateReclamation;
        this.dateResolution = dateResolution;
    }

}