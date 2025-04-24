import { Announcement } from './announcement';
import { Discussion } from './discussion.model';
import { User } from './user.model';  // Import de User pour les participants

export interface Club {
    id_club?: number; // Le '?' signifie que c'est optionnel (utile pour la création)
    name: string;
    description: string;
    creator?: User; // Référence à l'utilisateur créateur
    members?: User[]; // Liste des membres du club
    events?: Event[]; // Liste des événements organisés par le club
    discussions?: Discussion[]; // Liste des discussions dans le club
    logo: string;
    slogan: string;
    categorie: string;
    showFullDescription: boolean ;  // Ajouter cette propriété
    rating: number; 
    announcements?: Announcement[]; // 👈 Ajoute cette ligne
    // Ajoute une propriété pour le rating

  }
  