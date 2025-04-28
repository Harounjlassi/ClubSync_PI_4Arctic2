package tn.esprit.clubsync.entities;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id_role")
@ToString
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_role")
    private Integer id_role;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_type", nullable = false, unique = true)
    private Roletype roleType;

    public Integer getId_role() {
        return id_role;
    }

    public void setId_role(Integer id_role) {
        this.id_role = id_role;
    }

    public Roletype getRoleType() {
        return roleType;
    }

    public void setRoleType(Roletype roleType) {
        this.roleType = roleType;
    }

}
