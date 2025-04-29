export class Projet {
    id: number;
    nom: string;
    description: string;
    imageUrl: string;
    dateCreated: Date;
    lastUpdated: Date;
    status: string;
    createur : string;
    progress: number;
    createurId:number;
      // constructor for the Projet class, accepting parameters for each property
  
    constructor(
      id: number,
      nom: string,
      description: string,
      imageUrl: string,
      dateCreated: Date,
      lastUpdated: Date,
      status: string,
      createur: string
    ) {
      this.id = id;
      this.nom = nom;
      this.description = description;
      this.imageUrl = imageUrl;
      this.dateCreated = dateCreated;
      this.lastUpdated = lastUpdated;
      this.status = status;
      this.createur = createur;
    }
  
    
  }