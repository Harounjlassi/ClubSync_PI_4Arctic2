import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private errorSubject = new Subject<string>(); // Observable for error messages
  error$ = this.errorSubject.asObservable(); // Public observable to subscribe to

  showError(message: string) {
    this.errorSubject.next(message); // Emit error message
  }
}