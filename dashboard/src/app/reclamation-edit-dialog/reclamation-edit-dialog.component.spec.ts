import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationEditDialogComponent } from './reclamation-edit-dialog.component';

describe('ReclamationEditDialogComponent', () => {
  let component: ReclamationEditDialogComponent;
  let fixture: ComponentFixture<ReclamationEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReclamationEditDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamationEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
