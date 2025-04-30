import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookListFrontComponent } from './book-list-front.component';

describe('BookListFrontComponent', () => {
  let component: BookListFrontComponent;
  let fixture: ComponentFixture<BookListFrontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookListFrontComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookListFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
