import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetMessageComponent } from './projet-message.component';

describe('ProjetMessageComponent', () => {
  let component: ProjetMessageComponent;
  let fixture: ComponentFixture<ProjetMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjetMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
