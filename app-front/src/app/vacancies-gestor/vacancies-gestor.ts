import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vacancies-gestor',
  imports: [CommonModule],
  templateUrl: './vacancies-gestor.html',
  styleUrl: './vacancies-gestor.css',
})
export class VacanciesGestor implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private router = inject(Router);

  // Estados con Signals
  allVacancies = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  currentPage = signal<number>(1);
  itemsPerPage = 6;
  deletingId = signal<number | null>(null);

  // Computed para paginación
  totalPages = computed(() => Math.ceil(this.allVacancies().length / this.itemsPerPage));

  paginatedVacancies = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.allVacancies().slice(start, start + this.itemsPerPage);
  });

  ngOnInit() {
    this.loadVacancies();
  }

  loadVacancies() {
    this.isLoading.set(true);
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );

    // Asumiendo que esta ruta trae las vacantes que el gestor puede administrar
    this.http.get<any>('http://localhost:3000/vacancies/all', { headers }).subscribe({
      next: (res) => {
        this.allVacancies.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  createVacancy() {
    this.router.navigate(['/app/vacancies/create']);
  }

  editVacancy(id: number) {
    this.router.navigate(['/app/vacancies/edit', id]);
  }

  deleteVacancy(job: any) {
    const action = job.isActive ? 'eliminar' : 'restaurar';

    if (!confirm(`¿Estás seguro de ${action} esta vacante?`)) return;

    this.deletingId.set(job.idVacancy);

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );

    this.http.delete(`http://localhost:3000/vacancies/${job.idVacancy}`, { headers }).subscribe({
      next: () => {
        // 🔥 Toggle en lugar de eliminar
        this.allVacancies.update((v) =>
          v.map((item) =>
            item.idVacancy === job.idVacancy ? { ...item, isActive: !item.isActive } : item,
          ),
        );

        this.deletingId.set(null);
      },
      error: (err) => {
        alert(err.error?.message || 'Error al actualizar');
        this.deletingId.set(null);
      },
    });
  }

  // Navegación
  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }
  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  selectedVacancy = signal<any | null>(null);
  isModalOpen = signal<boolean>(false);

  openModal(vacancy: any) {
    this.selectedVacancy.set(vacancy);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }
}
