package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.Club;

import java.util.List;

public interface iClubRecommendationService {
    List<Club> recommendClubsByCategory(Long userId, int maxRecommendations);}
