package tn.esprit.clubsync.Controller;

import com.google.api.client.auth.oauth2.*;
import com.google.api.client.googleapis.auth.oauth2.*;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@CrossOrigin(origins = "http://localhost:4200")

public class GoogleCalendarController {

    private static final Logger logger = LoggerFactory.getLogger(GoogleCalendarController.class);

    @Value("${google.client.id}")
    private String CLIENT_ID ;

    @Value("${google.client.secret}")
    private String CLIENT_SECRET ;

    @Value("${google.redirect.uri}")
    private String REDIRECT_URI;
    private static final List<String> SCOPES =
            Collections.singletonList("https://www.googleapis.com/auth/calendar");
    private static final String APPLICATION_NAME = "ClubSync";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private final HttpTransport httpTransport;
    private GoogleAuthorizationCodeFlow flow;
    private final Map<String, Event> pendingEvents = new ConcurrentHashMap<>();

    public GoogleCalendarController() throws GeneralSecurityException, IOException {
        this.httpTransport = GoogleNetHttpTransport.newTrustedTransport();
    }

    @PostMapping(value = "/init-auth", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> initiateGoogleAuth(@RequestBody Map<String, Object> eventData) {
        try {
            if (eventData == null || !eventData.containsKey("summary")) {
                return errorResponse(HttpStatus.BAD_REQUEST,
                        "invalid_input", "Event summary is required");
            }

            Event event = createEventFromMap(eventData);
            String stateToken = UUID.randomUUID().toString();
            pendingEvents.put(stateToken, event);

            // Initialize OAuth flow
            GoogleClientSecrets clientSecrets = new GoogleClientSecrets()
                    .setWeb(new GoogleClientSecrets.Details()
                            .setClientId(CLIENT_ID)
                            .setClientSecret(CLIENT_SECRET));

            flow = new GoogleAuthorizationCodeFlow.Builder(
                    httpTransport,
                    JSON_FACTORY,
                    clientSecrets,
                    SCOPES)
                    .setAccessType("offline")
                    .setApprovalPrompt("force")
                    .build();

            String authorizationUrl = flow.newAuthorizationUrl()
                    .setRedirectUri(REDIRECT_URI)
                    .setState(stateToken)
                    .build();

            logger.info("Initiating OAuth flow for event: {}", event.getSummary());

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "authorization_url", authorizationUrl,
                    "state_token", stateToken
            ));

        } catch (Exception e) {
            logger.error("Failed to initiate OAuth flow", e);
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "initiation_failed", "Failed to initiate OAuth flow: " + e.getMessage());
        }
    }

    @GetMapping("/oauth-callback")
    public ResponseEntity<?> handleOAuthCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "error_description", required = false) String errorDescription,
            @RequestParam(value = "state") String stateToken) {

        try {
            if (error != null) {
                logger.error("OAuth error: {} - {}", error, errorDescription);
                return errorResponse(HttpStatus.BAD_REQUEST,
                        "oauth_error", errorDescription != null ? errorDescription : "Authorization failed");
            }

            if (code == null || code.isEmpty()) {
                return errorResponse(HttpStatus.BAD_REQUEST,
                        "missing_code", "Authorization code is required");
            }

            if (stateToken == null || !pendingEvents.containsKey(stateToken)) {
                return errorResponse(HttpStatus.BAD_REQUEST,
                        "invalid_state", "Invalid or expired state token");
            }

            TokenResponse tokenResponse = flow.newTokenRequest(code)
                    .setRedirectUri(REDIRECT_URI)
                    .execute();

            Credential credential = flow.createAndStoreCredential(tokenResponse, "user");
            logger.info("Successfully obtained credentials for state: {}", stateToken);

            Event event = pendingEvents.remove(stateToken);
            String eventId = createCalendarEvent(credential, event);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "event_id", eventId,
                    "event_summary", event.getSummary()
            ));

        } catch (Exception e) {
            logger.error("OAuth callback processing failed", e);
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "processing_failed", "Failed to process OAuth callback: " + e.getMessage());
        }
    }

    private Event createEventFromMap(Map<String, Object> eventData) {
        Event event = new Event()
                .setSummary((String) eventData.get("summary"))
                .setDescription((String) eventData.get("description"));

        if (eventData.containsKey("start")) {
            Map<String, String> startMap = (Map<String, String>) eventData.get("start");
            event.setStart(new EventDateTime()
                    .setDateTime(new DateTime(startMap.get("dateTime")))
                    .setTimeZone(startMap.get("timeZone")));
        }

        if (eventData.containsKey("end")) {
            Map<String, String> endMap = (Map<String, String>) eventData.get("end");
            event.setEnd(new EventDateTime()
                    .setDateTime(new DateTime(endMap.get("dateTime")))
                    .setTimeZone(endMap.get("timeZone")));
        }

        return event;
    }

    private String createCalendarEvent(Credential credential, Event event) throws IOException {
        Calendar calendarService = new Calendar.Builder(
                httpTransport,
                JSON_FACTORY,
                credential)
                .setApplicationName(APPLICATION_NAME)
                .build();

        if (event.getStart() == null || event.getEnd() == null) {
            throw new IllegalArgumentException("Event must have start and end times");
        }

        Event createdEvent = calendarService.events()
                .insert("primary", event)
                .execute();

        logger.info("Created calendar event: {} (ID: {})",
                event.getSummary(), createdEvent.getId());

        return createdEvent.getId();
    }

    private ResponseEntity<Map<String, String>> errorResponse(
            HttpStatus status, String error, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "status", "error",
                "error", error,
                "message", message
        ));
    }
}

