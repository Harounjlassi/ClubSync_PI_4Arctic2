import { Role } from './role.model';
import { Club } from './club.model';

export enum Sexe {
  HOMME = 'Homme',
  FEMME = 'Femme',
}

export class User {
  idUser?: number;
  firstname: string = '';
  lastname: string = '';
  email: string = '';
  motDePasse?: string;
  dateNaissance: Date = new Date();
  sexe: Sexe = Sexe.HOMME;
  photoProfil?: string;
  numeroDeTelephone?: number;
  role?: Role | string | string[];
  archived?: boolean = false;
  clubs?: Club[];

  constructor(data?: Partial<User>) {
    if (data) {
      Object.assign(this, data);
      
      if (data.dateNaissance && typeof data.dateNaissance === 'string') {
        this.dateNaissance = new Date(data.dateNaissance);
      }
      
      // Handle role conversion
      if (data.role) {
        if (data.role instanceof Role) {
          this.role = data.role;
        } else if (Array.isArray(data.role)) {
          this.role = data.role;
        } else if (typeof data.role === 'object') {
          this.role = new Role(data.role);
        }
      }
    }
  }
}