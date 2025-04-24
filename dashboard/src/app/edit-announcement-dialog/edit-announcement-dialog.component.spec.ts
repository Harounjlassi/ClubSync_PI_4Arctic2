import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAnnouncementDialogComponent } from './edit-announcement-dialog.component';

describe('EditAnnouncementDialogComponent', () => {
  let component: EditAnnouncementDialogComponent;
  let fixture: ComponentFixture<EditAnnouncementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAnnouncementDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAnnouncementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
