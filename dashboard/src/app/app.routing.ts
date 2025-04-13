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
import { ChatComponent } from './chat/chat.component';
import { JokeComponent } from './joke/joke.component';

const routes: Routes =[
  {
    path: '',
    redirectTo: 'dashboard',
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
      { path: 'jokes', component: JokeComponent },


      

     
    ]
  },
  { path: 'chat', component: ChatComponent },

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
