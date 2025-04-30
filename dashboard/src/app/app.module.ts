import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { FrontLayoutComponent } from './layouts/front-layout/front-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ServicesComponent } from './pages/services/services.component';
import { BlogComponent } from './pages/blog/blog.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { FromComponent } from './pages/from/from.component';
import { ClubListComponent } from './club-list/club-list.component';
import { AddClubDialogComponent } from './add-club-dialog/add-club-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EditClubDialogComponent } from './edit-club-dialog/edit-club-dialog.component';
import { ClubsComponent } from './clubs/clubs.component';
import { ClubMembersComponent } from './club-members/club-members.component';
import { ChatComponent } from './chat/chat.component';
import { JokeComponent } from './joke/joke.component';
import { AnnouncementListComponent } from './announcement-list/announcement-list.component';
import { AddAnnouncementDialogComponent } from './add-announcement-dialog/add-announcement-dialog.component';
import { EditAnnouncementDialogComponent } from './edit-announcement-dialog/edit-announcement-dialog.component';
import { AnnouncementDetailsDialogComponent } from './announcement-details-dialog/announcement-details-dialog.component';
import { ClickOutsideDirective } from './click-outside.directive';
import { AuthenticationComponent } from './authentication/authentication.component';
import { RegisterComponent } from './register/register.component';

// Angular Material Modules
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

// Third-party libraries
import { ToastrModule } from 'ngx-toastr';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { UserListComponent } from './user-list/user-list.component';
import { UserRegisterDialogComponent } from './user-register-dialog/user-register-dialog.component';
import { UserEditDialogComponent } from './user-edit-dialog/user-edit-dialog.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyCodeComponent } from './verify-code/verify-code.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { ReclamationListComponent } from './reclamation/reclamation-list/reclamation-list.component';
import { ReclamationEditComponent } from './reclamation/reclamation-edit/reclamation-edit.component';
import { ReclamationDetailComponent } from './reclamation/reclamation-detail/reclamation-detail.component';
import { ReclamationFormComponent } from './reclamationf/reclamation-form/reclamation-form.component';
import { ClubHomeComponent } from './club-home/club-home.component';
import { ProjetMessageComponent } from './projet-message/projet-message.component';
import { ProjetListComponent } from './projet-list/projet-list.component';
import { ProjectTaskListComponent } from './project-task-list/project-task-list.component';
import { ProjectReportListComponent } from './project-report-list/project-report-list.component';
import { ProjetsComponent } from './projets/projets.component';
import { ReclamationEditDialogComponent } from './reclamation-edit-dialog/reclamation-edit-dialog.component';
import { UserReclamationComponent } from './user-reclamation/user-reclamation.component';

@NgModule({
  imports: [
    // Angular Core Modules
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    ComponentsModule,
    CommonModule,  
    BrowserModule,
    // Angular Material Modules
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    
    // Third-party Modules
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      preventDuplicates: true,
    })
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    FrontLayoutComponent,
    HomeComponent,
    AboutComponent,
    ServicesComponent,
    BlogComponent,
    ScheduleComponent,
    FromComponent,
    ClubListComponent,
    AddClubDialogComponent,
    ConfirmDialogComponent,
    EditClubDialogComponent,
    ClubsComponent,
    ClubMembersComponent,
    ChatComponent,
    JokeComponent,
    AnnouncementListComponent,
    AddAnnouncementDialogComponent,
    EditAnnouncementDialogComponent,
    AnnouncementDetailsDialogComponent,
    ClickOutsideDirective,
    AuthenticationComponent,
    RegisterComponent,
    UserListComponent,
    UserRegisterDialogComponent,
    UserEditDialogComponent,
    ForgotPasswordComponent,
    VerifyCodeComponent,
    ResetPasswordComponent,
    UserSettingsComponent,
    ReclamationListComponent,
  ReclamationEditComponent,
    ReclamationDetailComponent,
    ReclamationFormComponent,
    ClubHomeComponent,
    ProjetMessageComponent,
    ProjetsComponent,
    ProjectTaskListComponent,
    ProjectReportListComponent,
    ProjetListComponent,
    ReclamationEditDialogComponent,
    UserReclamationComponent
   
  ],
  providers: [
   /* {
      provide: DomSanitizer,
      useValue: DomSanitizer
    }*/
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }