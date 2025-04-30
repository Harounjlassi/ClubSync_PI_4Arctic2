package tn.esprit.clubsync.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.RequestService;
import tn.esprit.clubsync.entities.Request;

import java.util.List;

@RestController
@RequestMapping("/book-requests")
@CrossOrigin(origins = "http://localhost:4200",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST,
                RequestMethod.PUT, RequestMethod.PATCH,
                RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequiredArgsConstructor
public class RequestController {
    private final RequestService requestService;

    @PostMapping
    public Request createRequest(@RequestBody Request request) {
        return requestService.createRequest(request);
    }

    @PatchMapping("/{id}/status")
    public Request updateStatus(
            @PathVariable Long id,
            @RequestParam Request.RequestStatus status,
            @RequestParam(required = false) String feedback) {
        return requestService.updateStatus(id, status, feedback);
    }

    @GetMapping("/user/{userId}")
    public List<Request> getUserRequests(@PathVariable Long userId) {
        return requestService.getUserRequests(userId);
    }

    @GetMapping
    public List<Request> getRequests(
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "PENDING") Request.RequestStatus status) {
        if (title != null) {
            return requestService.searchRequests(title);
        }
        return requestService.getRequestsByStatus(status);
    }
}