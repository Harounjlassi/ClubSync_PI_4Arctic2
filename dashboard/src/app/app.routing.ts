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
import { RegisterComponent } from './register/register.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyCodeComponent } from './verify-code/verify-code.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { ReclamationFormComponent } from './reclamationf/reclamation-form/reclamation-form.component';
import { ClubHomeComponent } from './club-home/club-home.component';
import { ProjetsComponent } from './projets/projets.component';
import { UserReclamationComponent } from './user-reclamation/user-reclamation.component';
import { BookListComponent } from './book-list/book-list.component';
import { BookAddComponent } from './book-add/book-add.component';
import { BookUpdateComponent } from './book-update/book-update.component';
import { ReviewListComponent } from './review-list/review-list.component';  // Import your component here
import { ReviewAddComponent } from './review-add/review-add.component'; // Import the ReviewAddComponent
import { RequestListComponent } from './request-list/request-list.component';
import { RequestAddComponent } from './request-add/request-add.component';
import { BorrowingListComponent } from './borrowing-list/borrowing-list.component';
import { ReviewAllComponent } from './review-all/review-all.component';
import { BookListFrontComponent } from './book-list-front/book-list-front.component';

const routes: Routes =[
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
    path: 'settings',
    component: UserSettingsComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'reclamationf',
    component: ReclamationFormComponent
    
  },
  {
    path: 'reclamationsview',
    component: UserReclamationComponent
    
  },
 
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
    
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
   
  },
  {
    path: 'verify-code',
    component: VerifyCodeComponent
    
  },

  {
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
      { path: 'club-home/:id', component: ClubHomeComponent },
      { path: 'projects', component: ProjetsComponent },
      { path: 'books', component: BookListFrontComponent },
      { path: 'reviews/:bookId', component: ReviewListComponent },  // Add this line
      { path: 'add-review/:bookId', component: ReviewAddComponent },
      { path: 'request-book', component: RequestAddComponent }, // For general requests



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
