export class Message {
    id: number;
    contenu: string;
    dateCreated: Date;
    lastUpdated: Date;
    ProjetId: number;
  isEditing: boolean;
  editedText: any;
    constructor(id: number, content: string, dateCreated: Date, lastUpdated: Date, ProjetId: number) {
        this.id = id;
        this.contenu = content;
        this.dateCreated = dateCreated;
        this.lastUpdated = lastUpdated;
        this.ProjetId = ProjetId;
    
    }
}