package tn.esprit.clubsync.entities;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "table-club")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id_club") // Utilisez le nom de votre identifiant ici


public class Club {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_club;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String logo;
    private String slogan;
    private String categorie;

    public Long getId_club() {
        return id_club;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getSlogan() {
        return slogan;
    }

    public void setSlogan(String slogan) {
        this.slogan = slogan;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public void setId_club(Long id_club) {
        this.id_club = id_club;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }



    public List<User> getMembers() {
        return members;
    }

    public void setMembers(List<User> members) {
        this.members = members;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }

    public List<Discussion> getDiscussions() {
        return discussions;
    }

    public void setDiscussions(List<Discussion> discussions) {
        this.discussions = discussions;
    }


    @ManyToMany
    @JoinTable(
            name = "club_members",                  // Name of the join table
            joinColumns = @JoinColumn(name = "club_id"),   // Column in the join table that references the Club entity
            inverseJoinColumns = @JoinColumn(name = "id")  // Column in the join table that references the Users entity (using id instead of user_id)
    )
    private List<User> members = new ArrayList<>();


    @OneToMany(mappedBy = "organize", cascade = CascadeType.ALL)
    private List<Event> events = new ArrayList<>();

    public List<Announcement> getAnnouncements() {
        return announcements;
    }

    public void setAnnouncements(List<Announcement> announcements) {
        this.announcements = announcements;
    }

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL)
    private List<Discussion> discussions = new ArrayList<>();

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL)
    List<Announcement> announcements = new ArrayList<>();
}

