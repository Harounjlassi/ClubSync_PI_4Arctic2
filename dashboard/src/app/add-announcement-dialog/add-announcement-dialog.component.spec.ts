import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAnnouncementDialogComponent } from './add-announcement-dialog.component';

describe('AddAnnouncementDialogComponent', () => {
  let component: AddAnnouncementDialogComponent;
  let fixture: ComponentFixture<AddAnnouncementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAnnouncementDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAnnouncementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
