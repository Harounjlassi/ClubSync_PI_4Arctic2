package tn.esprit.clubsync.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user")
@Data
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "role")
    private String role; // ADMIN, MEMBER, etc.

    @Column(name = "date_created")
    @CreationTimestamp
    private Date dateCreated;

    @Column(name = "last_login")
    private Date lastLogin;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Relationships
    @OneToMany(mappedBy = "createur", cascade = CascadeType.ALL)
    private Set<Projet> createdProjects = new HashSet<>();

    @OneToMany(mappedBy = "reporter", cascade = CascadeType.ALL)
    private Set<Report> submittedReports = new HashSet<>();

    // You might want to add more relationships based on your needs
    // For example, if users can be assigned to tasks:
    // @ManyToMany(mappedBy = "assignedUsers")
    // private Set<Tache> assignedTasks = new HashSet<>();
}