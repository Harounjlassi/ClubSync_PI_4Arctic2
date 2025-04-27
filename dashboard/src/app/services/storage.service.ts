import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Role, RoleType } from '../models/role.model';

const AUTH_KEY = 'clubsync-auth-data';
type StorageType = 'sessionStorage' | 'localStorage';
const DEFAULT_STORAGE_TYPE: StorageType = 'sessionStorage';

interface AuthData {
  token: string;
  user?: User;
  roles?: Role[];
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage;
  private currentStorageType: StorageType;

  constructor() {
    this.currentStorageType = DEFAULT_STORAGE_TYPE;
    this.storage = window[this.currentStorageType];
  }

  clean(): void {
    this.storage.removeItem(AUTH_KEY);
  }

  public saveAuthData(authData: AuthData): void {
    if (!authData?.token) {
      throw new Error('Cannot save authentication data without token');
    }
    
    try {
      const dataToStore = {
        token: authData.token,
        user: authData.user ? this.sanitizeUser(authData.user) : undefined,
        roles: authData.roles ? this.sanitizeRoles(authData.roles) : undefined
      };
      
      this.storage.setItem(AUTH_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Storage error:', error);
      this.clean();
      throw new Error('Failed to save authentication data');
    }
  }

  private sanitizeUser(user: User): User {
    return {
      ...user,
      dateNaissance: user.dateNaissance ? new Date(user.dateNaissance) : null
    };
  }

  private sanitizeRoles(roles: Role[]): Role[] {
    return roles.map(role => ({
      id: role.id,
      roleType: role.roleType
    }));
  }

  public getAuthData(): AuthData | null {
    const authStr = this.storage.getItem(AUTH_KEY);
    if (!authStr) return null;
    
    try {
      const parsed = JSON.parse(authStr);
      return {
        token: parsed.token,
        user: parsed.user ? this.sanitizeUser(parsed.user) : undefined,
        roles: parsed.roles ? this.sanitizeRoles(parsed.roles) : undefined
      };
    } catch (error) {
      console.error('Error parsing authentication data', error);
      this.clean();
      return null;
    }
  }

  public getToken(): string | null {
    return this.getAuthData()?.token || null;
  }

  public getUser(): User | null {
    const user = this.getAuthData()?.user;
    return user ? { ...user } : null;
  }

  public getRoles(): Role[] {
    const roles = this.getAuthData()?.roles;
    return roles ? [...roles] : [];
  }

  public getUserRoleTypes(): RoleType[] {
    return this.getRoles().map(role => role.roleType);
  }

  public isAdmin(): boolean {
    return this.getRoles().some(role => role.roleType === RoleType.ADMIN);
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  public setStorageType(type: StorageType, migrateExisting: boolean = false): void {
    if (this.currentStorageType === type) {
      return;
    }

    const previousStorage = this.storage;
    this.currentStorageType = type;
    this.storage = window[type];

    if (migrateExisting) {
      const authStr = previousStorage.getItem(AUTH_KEY);
      if (authStr) {
        this.storage.setItem(AUTH_KEY, authStr);
        previousStorage.removeItem(AUTH_KEY);
      }
    }
  }
}