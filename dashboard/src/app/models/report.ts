
export class Report {
    // Define properties and constructor for Report class here.
     id: number;
     title: string;
    description: string;
     status: string;
     dateCreated: Date;
     lastUpdated: Date;
     ReporterId: number;
     TacheTitre: string
    ReporterFirstName: string;
    selected: boolean;
    ProjetId: number;

    constructor(
      id: number,
      title: string,
      description: string,
      status: string,
      dateCreated: Date,
      lastUpdated: Date,
      ReporterId: number,
      TacheTitre: string,
      ReporterFirstName: string
      
     

     
      ) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.status = status;
      this.dateCreated = dateCreated;
      this.lastUpdated = lastUpdated;
      this.ReporterId = ReporterId;
      this.TacheTitre = TacheTitre;
      this.ReporterFirstName = ReporterFirstName;
      }
}
