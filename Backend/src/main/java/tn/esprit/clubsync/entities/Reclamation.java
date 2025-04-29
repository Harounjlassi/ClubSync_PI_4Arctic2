package tn.esprit.clubsync.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "reclamation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reclamation")
    private Integer idReclamation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nuser_id", nullable = false)
    private User nuser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin; // L'administrateur qui traite la réclamation (peut être null)

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "date_reclamation", nullable = false)
    private Date dateReclamation;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_reclamation", nullable = false)
    private TypeReclamation typeReclamation;

    public User getNuser() {
        return nuser;
    }

    public void setNuser(User nuser) {
        this.nuser = nuser;
    }

    public enum TypeReclamation {
        Club_Communication_Issue, Membership_Request_Delay, Project_Organization_Issue,OTHER
    }

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutReclamation statut;

    public enum StatutReclamation {
        IN_PROGRESS, RESOLVED,REJECTED
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "date_resolution")
    private Date dateResolution;

    @Column(name = "archived", nullable = false)
    private boolean archived = false;
}