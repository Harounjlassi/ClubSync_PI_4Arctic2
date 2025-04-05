package tn.esprit.clubsync.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "table-Message")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_message;

    @Column(columnDefinition = "TEXT")
    private String contenu;

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
}
