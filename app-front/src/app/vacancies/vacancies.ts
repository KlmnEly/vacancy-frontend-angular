import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ApiResponse, Vacancy } from './vanancies.interface';
import { LowerCasePipe, SlicePipe } from '@angular/common';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-vacancies',
  standalone: true,
  imports: [LowerCasePipe, SlicePipe],
  templateUrl: './vacancies.html',
  styleUrl: './vacancies.css',
})
export class Vacancies implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(Auth);

  allVacancies = signal<Vacancy[]>([]);
  currentPage = signal<number>(1);
  itemsPerPage = 20;
  isLoading = signal<boolean>(true);
  myApplications = signal<number[]>([]);
  applyingId = signal<number | null>(null);

  paginatedVacancies = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.allVacancies().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.allVacancies().length / this.itemsPerPage);
  });

  ngOnInit() {
    this.fetchVacancies();
    this.loadMyApplications();
  }

  fetchVacancies() {
    let token = null;

    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http.get<ApiResponse>('http://localhost:3000/vacancies', { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.allVacancies.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching vacancies:', err);
        this.isLoading.set(false);
      },
    });
  }

  loadMyApplications() {
    const userId = this.auth.userId();
    if (!userId) return;

    const headers = this.getHeaders();
    // Asumiendo que tu API tiene un endpoint para ver aplicaciones por usuario
    // Si no lo tiene, puedes filtrar el GET /applications general en el front
    this.http.get<any>('http://localhost:3000/applications/my-history', { headers }).subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.data)) {
          const appliedIds = res.data
            .filter((app: any) => Number(app.userId) === Number(userId))
            .map((app: any) => Number(app.vacancyId));

          this.myApplications.set(appliedIds);
          console.log('Aplicaciones del usuario cargadas:', this.myApplications());
        }
      },
      error: (err) => console.error('Error cargando aplicaciones previas', err),
    });
  }

  applyToVacancy(vacancyId: number) {
    const userId = this.auth.userId();

    if (!userId) {
      alert('No se pudo identificar tu sesión. Por favor, inicia sesión de nuevo.');
      return;
    }

    this.applyingId.set(vacancyId);
    // 2. Preparamos el cuerpo según lo que pide tu API
    const body = {
      userId: userId,
      vacancyId: vacancyId,
      appliedAt: new Date().toISOString(),
    };

    const headers = this.getHeaders();

    // 3. Petición POST a aplicaciones
    this.http.post('http://localhost:3000/applications', body, { headers }).subscribe({
      next: (res: any) => {
        alert('¡Has aplicado con éxito a la vacante!');
        this.myApplications.update((ids) => [...ids, vacancyId]);
        this.applyingId.set(null);
        // Refrescamos la lista para actualizar cupos si el backend lo permite
        this.fetchVacancies();
      },
      error: (err) => {
        console.error('Error al aplicar:', err);
        alert(err.error?.message || 'Hubo un error al procesar tu solicitud.');
        this.applyingId.set(null);
      },
    });
  }

  // --- HELPER PARA HEADERS (Evita repetir código) ---
  private getHeaders(): HttpHeaders {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
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
