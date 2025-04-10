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
// Import Angular Material modules
import { MatNativeDateModule } from '@angular/material/core'; //
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { EditClubDialogComponent } from './edit-club-dialog/edit-club-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ClubsComponent } from './clubs/clubs.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UserListComponent } from './user-list/user-list.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { RegisterComponent } from './register/register.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { TestCompsComponent } from './test-comps/test-comps.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

@NgModule({
  imports: [

    BrowserAnimationsModule as any,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatAutocompleteModule,  // <-- Ajout


     // Angular Material modules
     MatNativeDateModule,
     MatDialogModule,
     MatFormFieldModule,
     MatInputModule,
     MatButtonModule,
     MatSnackBarModule,
     MatIconModule,
     MatTableModule,       // Ajout du module pour les tables Angular Material
     MatPaginatorModule,
     MatCardModule,
     MatSelectModule,
     MatProgressSpinnerModule,
     MatTooltipModule,
     MatDatepickerModule,
     

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
    UserListComponent,
    AuthenticationComponent,
    RegisterComponent,
    UpdateUserComponent,
    TestCompsComponent,
    UnauthorizedComponent,
    


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
