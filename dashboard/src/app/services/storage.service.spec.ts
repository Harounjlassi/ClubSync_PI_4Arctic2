import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  /**
   * Clears user data from session storage
   */
  clean(): void {
    console.log('Cleaning user from storage');
    window.sessionStorage.removeItem(USER_KEY);
  }

  /**
   * Saves user data to session storage
   * @param user The user object to save
   */
  public saveUser(user: any): void {
    console.log('Saving user to storage');
    
    // Validate the user object has required fields
    if (!user) {
      console.error('Error: Attempting to save null or undefined user');
      return;
    }
    
    // Check if token exists before saving
    if (!user.token) {
      console.warn('Warning: Attempting to save user without token');
    }
    
    // Save user to session storage
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Verify storage was successful
    const savedUser = this.getUser();
    console.log('User saved successfully:', !!savedUser);
    console.log('Token present after saving:', !!savedUser?.token);
  }

  /**
   * Gets user data from session storage
   * @returns The user object or null if not found
   */
  public getUser(): any {
    const userStr = window.sessionStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user from storage:', e);
        this.clean(); // Clean up corrupted data
        return null;
      }
    }
    return null;
  }

  /**
   * Checks if the user is logged in by verifying a token exists
   * @returns true if logged in, false otherwise
   */
  public isLoggedIn(): boolean {
    const user = this.getUser();
    const hasToken = !!(user && user.token);
    console.log('isLoggedIn check:', hasToken);
    return hasToken;
  }
  
  /**
   * Gets the user's authentication token
   * @returns The token string or null if not found
   */
  public getToken(): string | null {
    const user = this.getUser();
    return user?.token || null;
  }
  
  /**
   * Gets the user's roles
   * @returns Array of role strings or empty array if not found
   */
  public getUserRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [];
  }
}