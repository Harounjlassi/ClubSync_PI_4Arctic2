import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddformPostComponent } from './addform-post.component';

describe('AddformPostComponent', () => {
  let component: AddformPostComponent;
  let fixture: ComponentFixture<AddformPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddformPostComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddformPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
