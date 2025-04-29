import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationEditComponent } from './reclamation-edit.component';

describe('ReclamationEditComponent', () => {
  let component: ReclamationEditComponent;
  let fixture: ComponentFixture<ReclamationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReclamationEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
