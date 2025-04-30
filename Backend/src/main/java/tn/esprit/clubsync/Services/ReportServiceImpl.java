package tn.esprit.clubsync.Services;

import org.springframework.stereotype.Service;
import tn.esprit.clubsync.Repo.ReportRepository;
import tn.esprit.clubsync.entities.Report;

import java.io.IOException;
import java.util.List;

@Service
public class ReportServiceImpl implements iReportService {


    private final ReportRepository   reportRepository;

    // Constructor injection is recommended
    public ReportServiceImpl(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Override
    public Report saveReport(Report Report) throws IOException {
        // Add any business logic/validation before saving

        return reportRepository.save(Report);
    }

    @Override
    public Report updateReport(Report Report, Long id) {
        // Check if Report exists
        Report existingReport = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + id));

        // Update fields - adjust according to your entity structure
        existingReport.setTitle(Report.getTitle());
        existingReport.setDescription(Report.getDescription());
        existingReport.setDateCreated(Report.getDateCreated());
        existingReport.setLastUpdated(Report.getLastUpdated());
        existingReport.setStatus(Report.getStatus());
        existingReport.setTacheId(Report.getTacheId());
        existingReport.setcProjetId(Report.getProjetId());
        existingReport.setReporterId(Report.getReporterId());


        return reportRepository.save(existingReport);
    }

    @Override
    public void deleteReport(Report Report) {
        reportRepository.delete(Report);
    }

    @Override
    public void deleteReportById(Long id) {
        reportRepository.deleteById(id);
    }

    @Override
    public List<Report> findReports() {

        return reportRepository.findAll();


    }

    @Override
    public Report findById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + id));
    }
    public List<Report> getReportsForProject(Long projetId) {
        return reportRepository.findReportsByProjetId(projetId);
    }
}
