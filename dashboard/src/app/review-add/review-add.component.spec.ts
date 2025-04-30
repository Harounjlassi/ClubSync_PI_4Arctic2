import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAddComponent } from './review-add.component';

describe('ReviewAddComponent', () => {
  let component: ReviewAddComponent;
  let fixture: ComponentFixture<ReviewAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReviewAddComponent]
    });
    fixture = TestBed.createComponent(ReviewAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
