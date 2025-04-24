package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.Projet;

import java.io.IOException;
import java.util.List;

public interface iProjetService {
    Projet saveProjet (Projet Projet) throws IOException;


    Projet updateProjet (Projet Projet,Long idE);
    void deleteProjet (Projet Projet);
    void deleteProjetById (Long id);
    List<Projet> findProjets();
    Projet findById(Long id) ;


}
