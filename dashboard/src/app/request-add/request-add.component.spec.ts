import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestAddComponent } from './request-add.component';

describe('RequestAddComponent', () => {
  let component: RequestAddComponent;
  let fixture: ComponentFixture<RequestAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestAddComponent]
    });
    fixture = TestBed.createComponent(RequestAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
