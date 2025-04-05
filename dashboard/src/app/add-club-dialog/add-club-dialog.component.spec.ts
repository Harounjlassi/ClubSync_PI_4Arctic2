import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClubDialogComponent } from './add-club-dialog.component';

describe('AddClubDialogComponent', () => {
  let component: AddClubDialogComponent;
  let fixture: ComponentFixture<AddClubDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddClubDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddClubDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
