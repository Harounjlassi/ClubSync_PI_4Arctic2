import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { FrontLayoutComponent } from './layouts/front-layout/front-layout.component';
import { AboutComponent } from './pages/about/about.component';
import { BlogComponent } from './pages/blog/blog.component';
import { FromComponent } from './pages/from/from.component';
import { HomeComponent } from './pages/home/home.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { ServicesComponent } from './pages/services/services.component';
import { ClubsComponent } from './clubs/clubs.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { RegisterComponent } from './register/register.component';
import { TestCompsComponent } from './test-comps/test-comps.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { IsAuthenticatedGuard } from './guards/is-authenticated.guard';
import { HasRoleGuard } from './guards/has-role.guard';

const routes: Routes = [
  // Default route redirects to login
  {
    path: '',
    redirectTo: 'front',
    pathMatch: 'full',
  },
  // Authentication routes (outside of layouts)
  {
    path: 'login',
    component: AuthenticationComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    
  },
  // Front layout and its child routes
  {
    path: 'front',
    component: FrontLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'from', component: FromComponent },
      { path: 'blog', component: BlogComponent },
      { path: 'schedule', component: ScheduleComponent },
      { path: 'clubs', component: ClubsComponent },
    ]
  },
  // Admin layout must be AFTER the specific routes to prevent conflicts
  {
    path: '',
    component: AdminLayoutComponent,
    children: [{
      path: '',
      loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule)
    }]
  },
  // Standalone routes
  {
    path: 'clubs',
    component: ClubsComponent
  },
  {
    path: 'test-comps',
    component: TestCompsComponent,
    canActivate: [IsAuthenticatedGuard, HasRoleGuard],
    data: {
      role: 'Admin',
    },
  },
  // Wildcard route for handling 404s (should be last)
  {
    path: '**',
    redirectTo: 'unauthorized',
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule { }