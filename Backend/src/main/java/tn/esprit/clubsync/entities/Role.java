package tn.esprit.clubsync.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;
import lombok.Generated;

@Entity
@Table(
        name = "role"
)
public class Role {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;
    @Enumerated(EnumType.STRING)
    private RoleName name;
    @JsonIgnore
    @OneToMany(
            mappedBy = "role"
    )
    private List<Users> users;

    @Generated
    public static RoleBuilder builder() {
        return new RoleBuilder();
    }

    @Generated
    public Long getId() {
        return this.id;
    }

    @Generated
    public RoleName getName() {
        return this.name;
    }

    @Generated
    public List<Users> getUsers() {
        return this.users;
    }

    @Generated
    public void setId(final Long id) {
        this.id = id;
    }

    @Generated
    public void setName(final RoleName name) {
        this.name = name;
    }

    @JsonIgnore
    @Generated
    public void setUsers(final List<Users> users) {
        this.users = users;
    }

    @Generated
    public Role(final Long id, final RoleName name, final List<Users> users) {
        this.id = id;
        this.name = name;
        this.users = users;
    }

    @Generated
    public Role() {
    }

    @Generated
    public static class RoleBuilder {
        @Generated
        private Long id;
        @Generated
        private RoleName name;
        @Generated
        private List<Users> users;

        @Generated
        RoleBuilder() {
        }

        @Generated
        public RoleBuilder id(final Long id) {
            this.id = id;
            return this;
        }

        @Generated
        public RoleBuilder name(final RoleName name) {
            this.name = name;
            return this;
        }

        @JsonIgnore
        @Generated
        public RoleBuilder users(final List<Users> users) {
            this.users = users;
            return this;
        }

        @Generated
        public Role build() {
            return new Role(this.id, this.name, this.users);
        }

        @Generated
        public String toString() {
            Long var10000 = this.id;
            return "Role.RoleBuilder(id=" + var10000 + ", name=" + String.valueOf(this.name) + ", users=" + String.valueOf(this.users) + ")";
        }
    }}
