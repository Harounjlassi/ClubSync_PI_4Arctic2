import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsPostFrontComponent } from './forms-post-front.component';

describe('FormsPostFrontComponent', () => {
  let component: FormsPostFrontComponent;
  let fixture: ComponentFixture<FormsPostFrontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormsPostFrontComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormsPostFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
