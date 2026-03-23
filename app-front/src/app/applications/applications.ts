import { DatePipe, NgClass } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../services/auth';
import { ApiResponse, Vacancy } from '../vacancies/vanancies.interface';
import { EnrichedApplication } from './enrichedApplication.interface';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class Applications implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(Auth);

  private allVacancies = signal<Vacancy[]>([]);
  private rawApplications = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  myApplications = computed(() => {
    const vacancies = this.allVacancies();
    const apps = this.rawApplications();

    return apps.map(app => {
      const details = vacancies.find(v => v.idVacancy === app.vacancyId);
      return {
        idApplication: app.idApplication,
        appliedAt: app.appliedAt,
        status: app.status,
        vacancyDetails: details // Contendrá título, empresa, etc.
      } as EnrichedApplication;
    });
  });

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    const headers = this.getHeaders();
    const userId = this.auth.userId();

    try {
      // 1. Cargamos todas las vacantes
      const vacRes = await this.http.get<ApiResponse>('http://localhost:3000/vacancies', { headers }).toPromise();
      if (vacRes?.success) this.allVacancies.set(vacRes.data);

      // 2. Cargamos las aplicaciones
      const appRes = await this.http.get<any>('http://localhost:3000/applications/my-history', { headers }).toPromise();
      if (appRes?.success) {
        // Filtramos por usuario
        const filtered = appRes.data.filter((a: any) => Number(a.userId) === Number(userId));
        this.rawApplications.set(filtered);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private getHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  }
