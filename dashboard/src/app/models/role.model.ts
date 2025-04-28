export enum RoleType {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export class Role {
  id?: number;
  roleType: RoleType;
  
  constructor(data?: Partial<Role>) {
    Object.assign(this, data || {});
  }
}
