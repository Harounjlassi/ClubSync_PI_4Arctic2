import { Role } from './role.model';

export enum Sexe {
  HOMME = 'HOMME',
  FEMME = 'FEMME'
}

export class User {
  idUser?: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string; // Used for registration/updates but not typically stored client-side
  dateNaissance: Date;
  sexe: Sexe;
  photoProfil?: string;
  numeroDeTelephone?: number;
  role?: Role;
  archived?: boolean;
  
  constructor(data?: Partial<User>) {
    Object.assign(this, data || {});
    
    // Convert string date to Date object if needed
    if (data?.dateNaissance && typeof data.dateNaissance === 'string') {
      this.dateNaissance = new Date(data.dateNaissance);
    }
  }
}