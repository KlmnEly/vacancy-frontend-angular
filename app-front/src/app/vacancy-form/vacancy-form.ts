import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vacancy-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vacancy-form.html',
  styleUrl: './vacancy-form.css',
})
export class VacancyForm implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  vacancyForm!: FormGroup;

  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  vacancyId: number | null = null;

  ngOnInit() {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vacancyId = Number(id);
      this.isEditMode.set(true);
      this.loadVacancy();
    }
  }

  initForm() {
    this.vacancyForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      location: ['', Validators.required],
      modality: ['', Validators.required],
      seniority: ['', Validators.required],
      description: ['', Validators.required],
      technologies: ['', Validators.required],
      salaryRange: [null, [Validators.required, Validators.min(1)]],
      maxApplicants: [1, [Validators.required, Validators.min(1)]],
    });
  }

  loadVacancy() {
    this.isLoading.set(true);

    const headers = this.getHeaders();

    this.http.get<any>(`http://localhost:3000/vacancies/${this.vacancyId}`, { headers }).subscribe({
      next: (res) => {
        const data = res.data;

        this.vacancyForm.patchValue(data);
        this.isLoading.set(false);
      },
      error: () => {
        alert('Error cargando vacante');
        this.isLoading.set(false);
      },
    });
  }

  submit() {
    if (this.vacancyForm.invalid) return;

    this.isSaving.set(true);
    const headers = this.getHeaders();
    const formValue = this.vacancyForm.value;
    const salaryRange = this.toPositiveNumber(formValue.salaryRange);
    const maxApplicants = this.toPositiveNumber(formValue.maxApplicants);

    if (salaryRange === null || maxApplicants === null) {
      alert('Salario y máximo de aplicantes deben ser números mayores que 0.');
      this.isSaving.set(false);
      return;
    }

    const payload = {
      title: formValue.title,
      description: formValue.description,
      technologies: formValue.technologies,
      seniority: formValue.seniority,
      softSkills: formValue.softSkills || '',
      location: formValue.location,
      modality: formValue.modality,
      salaryRange,
      company: formValue.company,
      maxApplicants,
    };

    if (this.isEditMode()) {
      // 🔥 EDITAR
      this.http
        .patch(`http://localhost:3000/vacancies/${this.vacancyId}`, payload, { headers })
        .subscribe({
          next: () => {
            alert('Vacante actualizada');
            this.router.navigate(['/app/vacancies-gestor']);
          },
          error: () => {
            alert('Error al actualizar');
            this.isSaving.set(false);
          },
        });
    } else {
      // 🔥 CREAR
      this.http.post(`http://localhost:3000/vacancies`, payload, { headers }).subscribe({
        next: () => {
          alert('Vacante creada');
          this.router.navigate(['/app/vacancies-gestor']);
        },
        error: () => {
          alert('Error al crear');
          this.isSaving.set(false);
        },
      });
    }
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
  }

  private toPositiveNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
}
