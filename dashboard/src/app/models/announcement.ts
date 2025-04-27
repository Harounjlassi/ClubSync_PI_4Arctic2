import { Club } from './club.model';

export interface Announcement {
  id?: number;
  title: string;
  content: string;
  createdAt?: Date;
  club?: Club | number;  // Peut être un objet Club ou un simple ID
  clubId?: number;  // Ajouter cette ligne

}
