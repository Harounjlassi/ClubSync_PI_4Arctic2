import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  // Clear all session storage
  clean(): void {
    window.sessionStorage.clear();
  }

  // Save user object (should include token)
  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Retrieve user object from storage
  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  // Check if user is logged in
  public isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  // Get JWT token from stored user
  public getToken(): string | null {
    const user = this.getUser();
    return user?.token || null; // Change 'token' to 'accessToken' or other key if needed
  }
}
