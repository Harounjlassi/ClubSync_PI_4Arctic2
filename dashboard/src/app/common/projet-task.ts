export class ProjetTask {
    id: string;
    titre: string;
    description: string;
    status: 'todo' | 'inProgress' | 'done';
    priorite: 'high' | 'medium' | 'low';
    dueDate: string;
    progress?: number;
    assignee?: string;
    label: string;
    completedDate?: string;
    ProjetId: number;
  
  
    constructor(
      id: string,
      titre: string,
      description: string,
      status: 'todo' | 'inProgress' | 'done',
      priorite: 'high' | 'medium' | 'low',
      dueDate: string,
      progress?: number,
      assignee?: string,
      label?: string,
      completedDate?: string
    ) {
      this.id = id;
      this.titre = titre;
      this.description = description;
      this.status = status;
      this.priorite = priorite;
      this.dueDate = dueDate;
      this.progress = progress;
      this.assignee = assignee;
      this.label = label;
      this.completedDate = completedDate;
    }
  }