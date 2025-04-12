package tn.esprit.clubsync.Controller;

import tn.esprit.clubsync.entities.GeminiModel;

import java.util.List;

public record ModelListResponse(String object, List<GeminiModel> data) {
}
