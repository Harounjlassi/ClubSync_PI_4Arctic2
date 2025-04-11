package tn.esprit.clubsync.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Table(name = "projetMessage")

public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name="contenu", columnDefinition = "TEXT")
    private String contenu;

    @ManyToOne
    @JoinColumn(name = "projet_id")
    @JsonIgnore

    private Projet projet;

    @JsonProperty("ProjetId")
    public Long getProjetId() {
        return projet != null ? projet.getId() : null;
    }
    @JsonProperty("projet")
    public void setProjetId(Long projetId) {
        this.projet = new Projet();
        this.projet.setId(projetId);
    }




    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContenu() {
        return contenu;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }


}
