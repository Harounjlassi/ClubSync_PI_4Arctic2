package tn.esprit.clubsync.dtos;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserStatsResponse {
    private long totalUsers;
    private Map<String, Long> countBySexe;
    private Map<String, Long> countByRole;
}
