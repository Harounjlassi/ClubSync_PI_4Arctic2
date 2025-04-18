import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementDetailsDialogComponent } from './announcement-details-dialog.component';

describe('AnnouncementDetailsDialogComponent', () => {
  let component: AnnouncementDetailsDialogComponent;
  let fixture: ComponentFixture<AnnouncementDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnouncementDetailsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
