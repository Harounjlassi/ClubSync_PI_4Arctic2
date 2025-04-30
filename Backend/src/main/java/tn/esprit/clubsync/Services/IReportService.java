package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.Report;

import java.io.IOException;
import java.util.List;

public interface iReportService {
    Report saveReport (Report Report) throws IOException;


    Report updateReport(Report Report,Long idE);
    void deleteReport (Report Report);
    void deleteReportById (Long id);
    List<Report> findReports();
    Report findById(Long id) ;

}
