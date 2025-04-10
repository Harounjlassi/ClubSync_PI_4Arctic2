import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListformComponent } from './listform.component';

describe('ListformComponent', () => {
  let component: ListformComponent;
  let fixture: ComponentFixture<ListformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListformComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
