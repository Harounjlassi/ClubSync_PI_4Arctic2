import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationFormComponent } from './reclamation-form.component';

describe('ReclamationFormComponent', () => {
  let component: ReclamationFormComponent;
  let fixture: ComponentFixture<ReclamationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReclamationFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
