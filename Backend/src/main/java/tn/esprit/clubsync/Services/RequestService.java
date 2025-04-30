package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.*;
import tn.esprit.clubsync.Repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class RequestService {
    private final RequestRepository requestRepository;
    private final UserRepository userRepository; // Add this line

    public Request createRequest(Request request) {
        // Validate user exists
        User user = userRepository.findById(request.getUser().getIdUser())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if this user already has a pending request for this ISBN
        if (request.getIsbn() != null &&
                requestRepository.existsByIsbnAndUserAndStatusNot(
                        request.getIsbn(),
                        user,
                        Request.RequestStatus.REJECTED)) {
            throw new IllegalStateException("You already have an active request for this book");
        }

        request.setUser(user);
        return requestRepository.save(request);
    }
    public Request updateStatus(Long requestId, Request.RequestStatus status, String feedback) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(status);
        request.setAdminFeedback(feedback);
        return requestRepository.save(request);
    }

    public List<Request> getUserRequests(Long userId) {
        return requestRepository.findByUserId(userId);
    }

    public List<Request> searchRequests(String title) {
        return requestRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Request> getRequestsByStatus(Request.RequestStatus status) {
        return requestRepository.findByStatus(status);
    }

}