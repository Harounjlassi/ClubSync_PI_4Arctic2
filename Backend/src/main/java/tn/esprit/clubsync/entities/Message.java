package tn.esprit.clubsync.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "projetMessage")
@Data
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name="contenu", columnDefinition = "TEXT")
    private String contenu;

    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;


    /**
    public Long getId_message() {
        return id_message;
    }

    public void setId_message(Long id_message) {
        this.id_message = id_message;
    }

    public String getContenu() {
        return contenu;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
    }

    public Users getAuteur() {
        return auteur;
    }

    public void setAuteur(Users auteur) {
        this.auteur = auteur;
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

    @ManyToOne
    @JoinColumn(name = "auteur_id")
    private Users auteur;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Projet project;

    @ManyToOne
    @JoinColumn(name = "tache_id")
    private Tache tache;

   */
}
