package tn.esprit.clubsync.dtos;

import tn.esprit.clubsync.entities.Sexe;

import java.util.Date;

public class UserFilterDTO {
    private String firstname;
    private String lastname;
    private String email;
    private Sexe sexe;
    private Date dateNaissanceMin;
    private Date dateNaissanceMax;
    private Boolean archived;
    private Long idRole;

    public String getFirstname() {
        return firstname;
    }

    public Long getIdRole() {
        return idRole;
    }

    public void setIdRole(Long idRole) {
        this.idRole = idRole;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Sexe getSexe() {
        return sexe;
    }

    public void setSexe(Sexe sexe) {
        this.sexe = sexe;
    }

    public Date getDateNaissanceMin() {
        return dateNaissanceMin;
    }

    public void setDateNaissanceMin(Date dateNaissanceMin) {
        this.dateNaissanceMin = dateNaissanceMin;
    }

    public Date getDateNaissanceMax() {
        return dateNaissanceMax;
    }

    public void setDateNaissanceMax(Date dateNaissanceMax) {
        this.dateNaissanceMax = dateNaissanceMax;
    }

    public Boolean getArchived() {
        return archived;
    }

    public void setArchived(Boolean archived) {
        this.archived = archived;
    }
}

