import { Sexe } from './user.model';
import { RoleType } from './role.model';

export class UserResponse {
  idUser!: number;
  firstname!: string;
  lastname!: string;
  email!: string;
  dateNaissance!: string | Date;
  sexe!: Sexe;
  photoProfil?: string;
  numeroDeTelephone?: number;
  role?: string | string[] | { roleType: RoleType };
  archived?: boolean;

  constructor(data?: Partial<UserResponse>) {
    if (data) {
      // Handle date before assignment
      const dateNaissance = data.dateNaissance 
        ? new Date(data.dateNaissance) 
        : null;
  
      Object.assign(this, {
        ...data,
        dateNaissance: dateNaissance || data.dateNaissance
      });
    }
  }
}