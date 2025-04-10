import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <h2>Accès refusé</h2>
    <p>Vous n’avez pas la permission d’accéder à cette page.</p>
  `,
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent {}
