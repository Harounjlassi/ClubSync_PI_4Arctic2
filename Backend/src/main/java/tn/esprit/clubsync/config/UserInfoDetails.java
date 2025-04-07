package tn.esprit.clubsync.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import tn.esprit.clubsync.entities.Roletype;
import tn.esprit.clubsync.entities.User;

import java.util.Collection;
import java.util.List;


public class UserInfoDetails implements UserDetails {

    private String email;
    private String password;
    private Roletype authorities;

    public UserInfoDetails(User user) {
        // Récupérer les informations dynamiquement à partir de l'entité User
        this.email = user.getEmail();
        this.password = user.getPassword();
        // Vous devez ajuster la gestion des rôles en fonction de votre modèle d'attributs
        this.authorities = user.getRole().getRoleType(); // user.getRoles() renvoie une liste d'objets Role
                 // Extraire le roleType de chaque role et le convertir en SimpleGrantedAuthority


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
        return true; // Vous pouvez adapter selon votre logique métier
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Vous pouvez adapter selon votre logique métier
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Vous pouvez adapter selon votre logique métier
    }

    @Override
    public boolean isEnabled() {
        return true; // Vous pouvez adapter selon votre logique métier
    }
}
