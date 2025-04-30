package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.ProjetTache;

import java.io.IOException;
import java.util.List;

public interface iTacheService {
    ProjetTache saveProjetTache (ProjetTache ProjetTache) throws IOException;


    ProjetTache updateProjetTache(ProjetTache ProjetTache,Long idE);
    void deleteProjetTache (ProjetTache ProjetTache);
    void deleteProjetTacheById (Long id);
    List<ProjetTache> findProjetTaches();
    ProjetTache findById(Long id) ;
    public List<ProjetTache> searchTacheByTitle(String tachTitle) ;
    public List<ProjetTache> searchTacheByIdProjet( Long IdProjet) ;
    public List<ProjetTache> searchTacheByStatus( Long IdProjet, String status) ;

}
