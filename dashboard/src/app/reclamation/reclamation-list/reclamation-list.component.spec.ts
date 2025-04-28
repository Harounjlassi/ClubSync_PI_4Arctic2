import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationListComponent } from './reclamation-list.component';

describe('ReclamationListComponent', () => {
  let component: ReclamationListComponent;
  let fixture: ComponentFixture<ReclamationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReclamationListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
