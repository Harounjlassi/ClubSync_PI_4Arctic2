import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReclamationComponent } from './user-reclamation.component';

describe('UserReclamationComponent', () => {
  let component: UserReclamationComponent;
  let fixture: ComponentFixture<UserReclamationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserReclamationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserReclamationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
