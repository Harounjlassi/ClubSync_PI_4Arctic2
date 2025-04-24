package tn.esprit.clubsync.Config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import tn.esprit.clubsync.entities.Roletype;
import tn.esprit.clubsync.entities.Sexe;
import tn.esprit.clubsync.entities.User;

import java.util.Collection;
import java.util.Date;
import java.util.List;

public class UserInfoDetails implements UserDetails {

    private final String email;
    private final String password;
    private final Roletype authorities;
    private final String firstName;
    private final String lastName;
    private final Date birthDate;
    private final Sexe gender;
    private final String phoneNumber;
    private final String profilePicture;
    private final boolean isArchived;

    public UserInfoDetails(User user) {
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.authorities = user.getRole().getRoleType();
        this.firstName = user.getLastname();
        this.lastName = user.getFirstname();
        this.birthDate = user.getDateNaissance();
        this.gender = user.getSexe();
        this.phoneNumber = user.getNumeroDeTelephone() != null ?
                user.getNumeroDeTelephone().toString() : null;
        // Convertir le tableau d'octets en Base64
        this.profilePicture = user.getPhotoProfil();
        this.isArchived = user.isArchived();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.authorities.name()));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isArchived;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !isArchived;
    }
}
