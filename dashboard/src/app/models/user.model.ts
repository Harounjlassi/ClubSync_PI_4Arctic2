import { Club } from './club.model';  // Import du modèle Club (si nécessaire)
import { Role } from './role.model';  // Import du modèle Role (si nécessaire)

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  dateOfBirth: string;  // Utilisation d'un string pour la date (format ISO 8601)
  email: string;
  password: string;
  accountLocked: boolean;
  enabled: boolean;
  createdDate: string;  // Date au format ISO
  lastModifiedDate: string;  // Date au format ISO
  role: Role;  // Référence au rôle de l'utilisateur
  clubs?: Club[];  // Liste des clubs auxquels l'utilisateur appartient
}
