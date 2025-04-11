import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
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

const routes: Routes =[
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  }, {
    path: '',
    component: AdminLayoutComponent,
    children: [{
      path: '',
      loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule)
    }]
  },
  {
    path: 'front',
    component: FrontLayoutComponent, // layout pour le front-office
    children: [
      { path: '', component: HomeComponent },        // page d'accueil
      { path: 'about', component: AboutComponent },    // page à propos
      { path: 'services', component: ServicesComponent },
      { path: 'from', component: FromComponent},
      { path: 'blog', component: BlogComponent }, 
      { path: 'schedule', component: ScheduleComponent },  
      { path: 'clubs', component: ClubsComponent },

      

     
    ]
  },
  { path: 'clubs', component: ClubsComponent },
  { path: 'login', component: AuthenticationComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'test-comps',
   component: TestCompsComponent,
   canActivate: [IsAuthenticatedGuard, HasRoleGuard],
   data: {
     role: 'Admin',
   },
   },
  { path: 'unauthorized', component: UnauthorizedComponent,
    canActivate: [IsAuthenticatedGuard],
   },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
       useHash: true
    })
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
