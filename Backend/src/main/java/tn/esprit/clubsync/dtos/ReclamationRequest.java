package tn.esprit.clubsync.dtos;

import lombok.Getter;
import lombok.Setter;
import tn.esprit.clubsync.entities.Reclamation;

import java.util.Date;

@Getter
@Setter
public class ReclamationRequest {

    private Date dateReclamation;
    private Reclamation.TypeReclamation typeReclamation;
    private String description;
    private Reclamation.StatutReclamation statut;
    private Date dateResolution;






}