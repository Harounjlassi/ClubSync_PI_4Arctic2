import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectReportListComponent } from './project-report-list.component';

describe('ProjectReportListComponent', () => {
  let component: ProjectReportListComponent;
  let fixture: ComponentFixture<ProjectReportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectReportListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
