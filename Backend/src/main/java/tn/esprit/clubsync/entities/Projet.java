package tn.esprit.clubsync.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.Date;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Table(name="projet")

public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "description")
    private String description;

    @Column(name = "progress")
    private Long progress;

    @Column(name = "image_url",columnDefinition = "LONGTEXT")

    private String imageUrl;

    @Column(name = "date_created")
    @Temporal (TemporalType.DATE)

    private Date dateCreated;

    @Column(name = "last_updated")
    @Temporal (TemporalType.DATE)

    private Date lastUpdated;

    @Column(name = "status")
    private String status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User createur;

    @JsonProperty("createurId")
    public Long getCreateurId() {
        return createur != null ? createur.getIdUser() : null;
    }

    @JsonProperty("createurId")
    public void setcreateurId(Long createurId) {
        this.createur = new User();
        this.createur.setIdUser(createurId);
    }

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL)
    @JsonIgnore

    private Set<ProjetTache> taches;

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL)
    @JsonIgnore

    private Set<Message> messages;

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL)
    @JsonIgnore

    private Set<Report> reports;


    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public Long getProgress() {
        return progress;
    }

    public void setProgress(Long progress) {
        this.progress = progress;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getCreateur() {
        return createur;
    }

    public void setCreateur(User createur) {
        this.createur = createur;
    }

    public Set<ProjetTache> getTaches() {
        return taches;
    }

    public void setTaches(Set<ProjetTache> taches) {
        this.taches = taches;
    }

    public Set<Message> getMessages() {
        return messages;
    }

    public void setMessages(Set<Message> messages) {
        this.messages = messages;
    }

    public Set<Report> getReports() {
        return reports;
    }

    public void setReports(Set<Report> reports) {
        this.reports = reports;
    }

    @Override
    public String toString() {
        return "Projet{id=" + id + ", nom='" + nom + "', description='" + description +

                "'}";
    }

}