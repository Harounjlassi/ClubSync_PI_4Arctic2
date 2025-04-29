
package tn.esprit.clubsync.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Table(name = "projetReport")
//@Data -- known bug

public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;


    @Column(name="title")
    private String title;

    @Column(name="description", columnDefinition = "TEXT")
    private String description;

    @Column(name="status")
    private String status;

    @Column(name="date_created")
    @CreationTimestamp
    private Date dateCreated;

    @Column(name="last_updated")
    @UpdateTimestamp
    private Date lastUpdated;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User reporter;

    @JsonProperty("ReporterFirstName")
    public String getFirstName() {
        return reporter != null ? reporter.getFirstname() : null;
    }
    @JsonProperty("ReporterId")
    public Long getReporterId() {
        return reporter != null ? reporter.getIdUser() : null;
    }
    @JsonProperty("ReporterId")
    public void setReporterId(Long ReporterId) {
        this.reporter = new User();
        this.reporter.setIdUser(ReporterId);
    }



    @ManyToOne
    @JoinColumn(name = "projet_id")
    @JsonIgnore
    private Projet projet;

    @JsonProperty("ProjetId")
    public Long getProjetId() {
        return projet != null ? projet.getId() : null;
    }

    @JsonProperty("ProjetId")
    public void setcProjetId(Long ProjetId) {
        this.projet = new Projet();
        this.projet.setId(ProjetId);
    }


    @ManyToOne
    @JoinColumn(name = "tache_id")
    @JsonIgnore
    private ProjetTache tache;

    @JsonProperty("TacheTitre")
    public String getTitre() {
        return tache != null ? tache.getTitre() : null;
    }
    @JsonProperty("TacheId")
    public Long getTacheId() {
        return tache != null ? tache.getId() : null;
    }
    @JsonProperty("TacheId")
    public void setTacheId(Long TacheId) {
        this.tache = new ProjetTache();
        this.tache.setId(TacheId);
    }




    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getReporter() {
        return reporter;
    }

    public void setReporter(User reporter) {
        this.reporter = reporter;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(Date dateCreated) {
        this.dateCreated = dateCreated;
    }

    public Date getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Date lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }

    public ProjetTache getTache() {
        return tache;
    }

    public void setTache(ProjetTache tache) {
        this.tache = tache;
    }

    @Override
    public String toString() {
        return "Report{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", status='" + status + '\'' +
                ", dateCreated=" + dateCreated +
                ", lastUpdated=" + lastUpdated +

                '}';
    }

}
