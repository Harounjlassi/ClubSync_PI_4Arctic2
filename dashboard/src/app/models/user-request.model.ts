import { Sexe } from './user.model';

export class UserRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  dateNaissance: Date;
  sexe: Sexe;
  numeroDeTelephone?: number;
  photoProfil?: string;
  id_role: number;
  
  constructor(data?: Partial<UserRequest>) {
    Object.assign(this, data || {});
  }
}