package tn.esprit.clubsync.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import javax.security.auth.Subject;
import lombok.Generated;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(
        name = "user"
)
@EntityListeners({AuditingEntityListener.class})
public class Users implements UserDetails, Principal {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;
    private String firstname;
    private String lastname;
    private LocalDate dateOfBirth;
    @Column(
            unique = true
    )
    private String email;
    private String password;
    private boolean accountLocked;
    private boolean enabled;
    @CreatedDate
    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdDate;
    @LastModifiedDate
    @Column(
            insertable = false
    )
    private LocalDateTime LastModifiedDate;
    @ManyToOne
    @JoinColumn(
            name = "ID_ROLE",
            referencedColumnName = "id"
    )
    private Role role;

    public String getName() {
        return this.email;
    }

    public boolean implies(Subject subject) {
        return Principal.super.implies(subject);
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    public String getPassword() {
        return this.password;
    }

    public String getUsername() {
        return this.email;
    }

    public boolean isAccountNonExpired() {
        return true;
    }

    public boolean isAccountNonLocked() {
        return !this.accountLocked;
    }

    public boolean isCredentialsNonExpired() {
        return true;
    }

    public boolean isEnabled() {
        return this.enabled;
    }

    public String fullName() {
        return this.firstname + " " + this.lastname;
    }

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstname() {
        return this.firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return this.lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public LocalDate getDateOfBirth() {
        return this.dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isAccountLocked() {
        return this.accountLocked;
    }

    public void setAccountLocked(boolean accountLocked) {
        this.accountLocked = accountLocked;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedDate() {
        return this.createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getLastModifiedDate() {
        return this.LastModifiedDate;
    }

    public void setLastModifiedDate(LocalDateTime lastModifiedDate) {
        this.LastModifiedDate = lastModifiedDate;
    }

    public Role getRole() {
        return this.role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    @Generated
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    @Generated
    public Users(final Long id, final String firstname, final String lastname, final LocalDate dateOfBirth, final String email, final String password, final boolean accountLocked, final boolean enabled, final LocalDateTime createdDate, final LocalDateTime LastModifiedDate, final Role role) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.dateOfBirth = dateOfBirth;
        this.email = email;
        this.password = password;
        this.accountLocked = accountLocked;
        this.enabled = enabled;
        this.createdDate = createdDate;
        this.LastModifiedDate = LastModifiedDate;
        this.role = role;
    }

    @Generated
    public Users() {
    }

    @Generated
    public static class UserBuilder {
        @Generated
        private Long id;
        @Generated
        private String firstname;
        @Generated
        private String lastname;
        @Generated
        private LocalDate dateOfBirth;
        @Generated
        private String email;
        @Generated
        private String password;
        @Generated
        private boolean accountLocked;
        @Generated
        private boolean enabled;
        @Generated
        private LocalDateTime createdDate;
        @Generated
        private LocalDateTime LastModifiedDate;
        @Generated
        private Role role;

        @Generated
        UserBuilder() {
        }

        @Generated
        public UserBuilder id(final Long id) {
            this.id = id;
            return this;
        }

        @Generated
        public UserBuilder firstname(final String firstname) {
            this.firstname = firstname;
            return this;
        }

        @Generated
        public UserBuilder lastname(final String lastname) {
            this.lastname = lastname;
            return this;
        }

        @Generated
        public UserBuilder dateOfBirth(final LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
            return this;
        }

        @Generated
        public UserBuilder email(final String email) {
            this.email = email;
            return this;
        }

        @Generated
        public UserBuilder password(final String password) {
            this.password = password;
            return this;
        }

        @Generated
        public UserBuilder accountLocked(final boolean accountLocked) {
            this.accountLocked = accountLocked;
            return this;
        }

        @Generated
        public UserBuilder enabled(final boolean enabled) {
            this.enabled = enabled;
            return this;
        }

        @Generated
        public UserBuilder createdDate(final LocalDateTime createdDate) {
            this.createdDate = createdDate;
            return this;
        }

        @Generated
        public UserBuilder LastModifiedDate(final LocalDateTime LastModifiedDate) {
            this.LastModifiedDate = LastModifiedDate;
            return this;
        }

        @Generated
        public UserBuilder role(final Role role) {
            this.role = role;
            return this;
        }

        @Generated
        public Users build() {
            return new Users(this.id, this.firstname, this.lastname, this.dateOfBirth, this.email, this.password, this.accountLocked, this.enabled, this.createdDate, this.LastModifiedDate, this.role);
        }

        @Generated
        public String toString() {
            Long var10000 = this.id;
            return "User.UserBuilder(id=" + var10000 + ", firstname=" + this.firstname + ", lastname=" + this.lastname + ", dateOfBirth=" + String.valueOf(this.dateOfBirth) + ", email=" + this.email + ", password=" + this.password + ", accountLocked=" + this.accountLocked + ", enabled=" + this.enabled + ", createdDate=" + String.valueOf(this.createdDate) + ", LastModifiedDate=" + String.valueOf(this.LastModifiedDate) + ", role=" + String.valueOf(this.role) + ")";
        }
    }}