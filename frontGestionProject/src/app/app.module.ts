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
import { TestComponent } from './test/test.component';
import { ProjetListComponent } from './projet-list/projet-list.component';
import { ProjectTaskListComponent } from './project-task-list/project-task-list.component';
import { ProjectReportListComponent } from './project-report-list/project-report-list.component';
import { ProjetsComponent } from './pages/projets/projets.component';

@NgModule({
  imports: [
    

    BrowserAnimationsModule as any,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
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
    TestComponent,
    ProjetListComponent,
    ProjectTaskListComponent,
    ProjectReportListComponent,
    ProjetsComponent,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
