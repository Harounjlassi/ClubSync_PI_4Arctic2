import { Sexe } from './user.model';

export class UserRequest {
  firstname: string;
  lastname: string;
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