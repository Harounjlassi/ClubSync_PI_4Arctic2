package tn.esprit.clubsync.Controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubsync.Services.ProjetServiceImpl;
import tn.esprit.clubsync.Services.ReportServiceImpl;
import tn.esprit.clubsync.entities.Projet;
import tn.esprit.clubsync.entities.ProjetTache;
import tn.esprit.clubsync.entities.Report;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


@RestController
@RequestMapping("reports")
@CrossOrigin(origins = "http://localhost:4200")
public class ReportController {

    private final ReportServiceImpl reportService;

    public ReportController(ReportServiceImpl reportService) {
        this.reportService = reportService;
    }


    @GetMapping("/simple")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Works");
    }
    @GetMapping("/all")
    public ResponseEntity<List<Report>> getAllProjets() {
        // Create a defensive copy to prevent modification during serialization
        List<Report> reports = new ArrayList<>(reportService.findReports());
        //log the rersponse?
        System.out.println("Response: " + reports);

        return ResponseEntity.ok(reports);
    }
    @PostMapping("/add")
    public ResponseEntity<Report> addTache(@RequestBody Report Report) throws IOException {
        Report savedReport = reportService.saveReport(Report);
        return ResponseEntity.ok(savedReport);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Report> updateTache(@PathVariable Long id, @RequestBody Report Report) {
        Report.setId(id);
        Report updatedReport = reportService.updateReport(Report, id);
        return ResponseEntity.ok(updatedReport);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTache(@PathVariable Long id) {
        reportService.deleteReportById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/findByProjetId/{id}")
    public ResponseEntity<List<Report>> getReportsByProjetId(@PathVariable Long id) {
        List<Report> reports = reportService.getReportsForProject(id);
        return ResponseEntity.ok(reports);
    }


}
