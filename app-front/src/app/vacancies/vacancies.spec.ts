import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Vacancies } from './vacancies';

describe('Vacancies', () => {
  let component: Vacancies;
  let fixture: ComponentFixture<Vacancies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vacancies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Vacancies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
