import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacanciesGestor } from './vacancies-gestor';

describe('VacanciesGestor', () => {
  let component: VacanciesGestor;
  let fixture: ComponentFixture<VacanciesGestor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacanciesGestor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacanciesGestor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
