package tn.esprit.clubsync.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "book_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, name = "request_date")
    private LocalDateTime requestDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('PENDING', 'APPROVED', 'REJECTED', 'PURCHASED') DEFAULT 'PENDING'")
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "admin_feedback")
    private String adminFeedback;

    // Book details
    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String isbn;
    private String publisher;

    @Column(name = "request_reason")
    private String requestReason;

    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED,
        PURCHASED
    }
}