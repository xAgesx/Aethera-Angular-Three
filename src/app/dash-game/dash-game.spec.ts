import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashGame } from './dash-game';

describe('DashGame', () => {
  let component: DashGame;
  let fixture: ComponentFixture<DashGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashGame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashGame);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
