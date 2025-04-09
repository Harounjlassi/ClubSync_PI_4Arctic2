import { Club } from './club.model';  // Import de Club pour la référence à l'organisateur
import { User } from './user.model';  // Import de User pour les participants

export interface Event {
  id_event?: number;  // L'id peut être optionnel pour la création
  name: string;
  description: string;
  organize: Club;  // Référence au club organisateur
  event_date: string;  // Utilisation d'un string pour la date (en ISO 8601)
  location: string;
  participants: User[];  // Liste des participants à l'événement
}
