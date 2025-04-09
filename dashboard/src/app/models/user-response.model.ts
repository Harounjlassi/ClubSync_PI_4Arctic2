import { Role, RoleType } from './role.model';
import { Sexe } from './user.model';

export class UserResponse {
  idUser: number;
  nom: string;
  prenom: string;
  email: string;
  dateNaissance: Date;
  sexe: Sexe;
  photoProfil?: string;
  numeroDeTelephone?: number;
  role: Role;
  archived: boolean;
  
  constructor(data?: Partial<UserResponse>) {
    Object.assign(this, data || {});
    
    // Convert string date to Date object if needed
    if (data?.dateNaissance && typeof data.dateNaissance === 'string') {
      this.dateNaissance = new Date(data.dateNaissance);
    }
  }
}