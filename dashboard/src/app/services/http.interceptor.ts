import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { StorageService } from './storage.service';
import { EventBusService } from './event-bus.service';
import { EventData } from './event.class';
import { UserService } from './user.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private authService: UserService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    request = request.clone({
      headers: request.headers.set('authorization', this.authService.token),
    });

    return next.handle(request);
  }
}

export const AuthInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: HttpRequestInterceptor,
  multi: true,
};