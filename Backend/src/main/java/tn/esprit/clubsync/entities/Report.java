
package tn.esprit.clubsync.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.util.Date;

@Entity
@Table(name = "projetReport")
@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users reporter;

    @Column(name="title")
    private String title;

    @Column(name="description", columnDefinition = "TEXT")
    private String description;

    @Column(name="date_created")
    @CreationTimestamp
    private Date dateCreated;


    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @ManyToOne
    @JoinColumn(name = "tache_id")
    private ProjetTache tache;

/**
    public Long getId_report() {
        return id_report;
    }

    public void setId_report(Long id_report) {
        this.id_report = id_report;
    }

    public Users getReporter() {
        return reporter;
    }

    public void setReporter(Users reporter) {
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

    public LocalDateTime getReport_date() {
        return report_date;
    }

    public void setReport_date(LocalDateTime report_date) {
        this.report_date = report_date;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Projet getProject() {
        return project;
    }

    public void setProject(Projet project) {
        this.project = project;
    }

    public Tache getTache() {
        return tache;
    }

    public void setTache(Tache tache) {
        this.tache = tache;
    }

    public List<Users> getParticipants() {
        return participants;
    }

    public void setParticipants(List<Users> participants) {
        this.participants = participants;
    }

    @ManyToMany
    @JoinTable(
            name = "report_participants",
            joinColumns = @JoinColumn(name = "report_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
            )
    private List<Users> participants = new ArrayList<>();


*/
}
