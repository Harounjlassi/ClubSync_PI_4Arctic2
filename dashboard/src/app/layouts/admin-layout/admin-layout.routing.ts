import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { MapsComponent } from '../../maps/maps.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { UpgradeComponent } from '../../upgrade/upgrade.component';
import { ClubListComponent } from 'app/club-list/club-list.component';
import { ClubMembersComponent } from 'app/club-members/club-members.component';
import { AnnouncementListComponent } from 'app/announcement-list/announcement-list.component';
import { UserListComponent } from 'app/user-list/user-list.component';
import { UserRegisterDialogComponent } from 'app/user-register-dialog/user-register-dialog.component';  
import { ReclamationListComponent } from 'app/reclamation/reclamation-list/reclamation-list.component';
import { ProjetListComponent } from 'app/projet-list/projet-list.component';
import { ProjectReportListComponent } from 'app/project-report-list/project-report-list.component';
import { ProjectTaskListComponent } from 'app/project-task-list/project-task-list.component';
import { ProjetMessageComponent } from 'app/projet-message/projet-message.component';
import { ReclamationEditComponent } from 'app/reclamation/reclamation-edit/reclamation-edit.component';
import { ReclamationDetailComponent } from 'app/reclamation/reclamation-detail/reclamation-detail.component';

export const AdminLayoutRoutes: Routes = [
    // {
    //   path: '',
    //   children: [ {
    //     path: 'dashboard',
    //     component: DashboardComponent
    // }]}, {
    // path: '',
    // children: [ {
    //   path: 'userprofile',
    //   component: UserProfileComponent
    // }]
    // }, {
    //   path: '',
    //   children: [ {
    //     path: 'icons',
    //     component: IconsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'notifications',
    //         component: NotificationsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'maps',
    //         component: MapsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'typography',
    //         component: TypographyComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'upgrade',
    //         component: UpgradeComponent
    //     }]
    // }
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'user-profile',   component: UserProfileComponent },
    { path: 'table-list',     component: TableListComponent },
    { path: 'typography',     component: TypographyComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'maps',           component: MapsComponent },
    { path: 'notifications',  component: NotificationsComponent },
    { path: 'upgrade',        component: UpgradeComponent },
    { path: 'club-list', component: ClubListComponent },
    { path: 'club-members/:clubId', component: ClubMembersComponent },
    { path: 'announcment-list', component: AnnouncementListComponent },
    { path: 'user-list', component: UserListComponent },
    {path: 'user-register', component: UserRegisterDialogComponent},// Nouvelle route pour UserRegisterDialogComponent
    { 
        path: 'reclamation-list', 
        component: ReclamationListComponent 
      },
      { 
        path: 'reclamation-edit/:id', 
        component: ReclamationEditComponent 
      },
      { 
        path: 'reclamation-detail/:id', 
        component: ReclamationDetailComponent // You should create this if needed
      },
    { path: 'projet',        component: ProjetListComponent },
    { path: 'projet-reports/:id',        component: ProjectReportListComponent },
    { path: 'projet-tasks/:id',        component: ProjectTaskListComponent },
    { path: 'projet-messages/:id',        component: ProjetMessageComponent },
      
    // Nouvelle route pour ClubListComponent

];
