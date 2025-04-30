package tn.esprit.clubsync.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.clubsync.entities.Request;
import tn.esprit.clubsync.entities.User;

import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByStatus(Request.RequestStatus status);
    List<Request> findByTitleContainingIgnoreCase(String title);
    boolean existsByIsbnAndUserAndStatusNot(String isbn, User user, Request.RequestStatus status);

    @Query("SELECT r FROM Request r WHERE r.user.idUser = :userId")
    List<Request> findByUserId(@Param("userId") Long userId);
}