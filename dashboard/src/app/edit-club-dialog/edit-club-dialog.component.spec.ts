import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClubDialogComponent } from './edit-club-dialog.component';

describe('EditClubDialogComponent', () => {
  let component: EditClubDialogComponent;
  let fixture: ComponentFixture<EditClubDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditClubDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditClubDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
