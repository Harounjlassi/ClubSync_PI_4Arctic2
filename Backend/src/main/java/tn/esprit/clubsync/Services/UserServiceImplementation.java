package tn.esprit.clubsync.Services;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.clubsync.entities.Role;
import tn.esprit.clubsync.entities.Sexe;
import tn.esprit.clubsync.entities.User;
import tn.esprit.clubsync.Mapper.UserMapper;
import tn.esprit.clubsync.Repo.RoleRepository;
import tn.esprit.clubsync.Repo.UserRepository;
import tn.esprit.clubsync.dtos.UserRequest;
import tn.esprit.clubsync.dtos.UserResponse;
import tn.esprit.clubsync.dtos.UserStatsResponse;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserServiceImplementation implements IUserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
@Autowired
private RoleRepository roleRepository;
    @Override
    public User updateUser(Long id, UserRequest userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setNom(userRequest.getNom());
        user.setPrenom(userRequest.getPrenom());
        user.setEmail(userRequest.getEmail());
        user.setDateNaissance(userRequest.getDateNaissance());
        user.setSexe(userRequest.getSexe());
        user.setNumeroDeTelephone(userRequest.getNumeroDeTelephone());
        user.setPhotoProfil(userRequest.getPhotoProfil());

        if (userRequest.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }

        if (userRequest.getId_role() != null) {
            Role role = roleRepository.findById(userRequest.getId_role())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }

        return userRepository.save(user);
    }


    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByArchivedFalse()
                .stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getIdUser(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getDateNaissance(),
                user.getSexe(),
                user.getNumeroDeTelephone(),
                user.getPhotoProfil(),
                user.getRole() != null ? Collections.singletonList(user.getRole().getRoleType().name()) : null
        );
    }


    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }
    public void archiveUser(Long idUser) {
        User user = userRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (user.isArchived()) {
            throw new RuntimeException("Utilisateur déjà archivé");
        }

        user.setArchived(true);
        userRepository.save(user);
    }
    @Override
    public void restoreUser(Long id) {
        User user = userRepository.findById(id)
                .filter(User::isArchived)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé ou déjà actif"));

        user.setArchived(false);
        userRepository.save(user);
    }
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private UserMapper userMapper;

    @Override
    public List<UserResponse> filterByField(String field, String value) {
        List<User> users;
        switch (field.toLowerCase()) {
            case "nom":
                users = userRepository.findByNomContainingIgnoreCase(value);
                break;
            case "prenom":
                users = userRepository.findByPrenomContainingIgnoreCase(value);
                break;

            case "sexe":
                users = userRepository.findBySexe(Sexe.valueOf(value));
                break;
            case "archived":
                users = userRepository.findByArchived(Boolean.parseBoolean(value));
                break;
            default:
                throw new IllegalArgumentException("Champ de filtre invalide: " + field);
        }

        return users.stream().map(userMapper::mapToResponse).collect(Collectors.toList());
    }


    @Override
    public Page<UserResponse> getUsersSortedByPrenom(Pageable pageable) {
        try {
            Page<User> users = userRepository.findAll(pageable);
            return users.map(userMapper::mapToResponse);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public UserStatsResponse getUserStats() {
        List<User> users = userRepository.findAll();

        long total = users.size();

        Map<String, Long> countBySexe = users.stream()
                .collect(Collectors.groupingBy(
                        user -> user.getSexe().toString(), Collectors.counting()));

        Map<String, Long> countByRole = users.stream()
                .collect(Collectors.groupingBy(
                        user -> user.getRole().getRoleType().name(), Collectors.counting()));


        return new UserStatsResponse(total, countBySexe, countByRole);
    }

    @Override
    public boolean isEmailTaken(String email) {
        return userRepository.existsByEmail(email);
    }
}

