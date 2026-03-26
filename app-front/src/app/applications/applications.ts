import { DatePipe, NgClass } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../services/auth';
import { ApiResponse, Vacancy } from '../vacancies/vanancies.interface';
import { ApplicationStatus } from './application-status.enum';
import { EnrichedApplication } from './enrichedApplication.interface';

interface ApplicationRecord {
  idApplication: number;
  appliedAt: string;
  status: ApplicationStatus;
  userId?: number;
  userEmail?: string;
  vacancyId?: number;
  idVacancy?: number;
}

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
  applicationStatus = ApplicationStatus;

  private allVacancies = signal<Vacancy[]>([]);
  private rawApplications = signal<ApplicationRecord[]>([]);
  isLoading = signal<boolean>(true);
  updatingId = signal<number | null>(null);

  isReviewer = computed(() => {
    const role = this.auth.role()?.toUpperCase() ?? '';
    return role === 'ADMIN' || role === 'GESTOR';
  });

  myApplications = computed(() => {
    const vacancies = this.allVacancies();
    const apps = this.rawApplications();

    return apps.map((app) => {
      const relatedVacancyId = Number(app.vacancyId ?? app.idVacancy ?? 0);
      const details = vacancies.find((v) => v.idVacancy === relatedVacancyId);
      return {
        idApplication: app.idApplication,
        appliedAt: app.appliedAt,
        status: app.status,
        vacancyId: relatedVacancyId,
        userId: app.userId,
        userEmail: app.userEmail,
        vacancyDetails: details,
      } as EnrichedApplication;
    });
  });

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    const headers = this.getHeaders();
    const userEmail = this.auth.email();
    const isReviewer = this.isReviewer();

    try {
      const vacRes = await this.http
        .get<ApiResponse>('http://localhost:3000/vacancies', { headers })
        .toPromise();
      if (vacRes?.success) this.allVacancies.set(vacRes.data);

      if (!isReviewer && !userEmail) {
        this.rawApplications.set([]);
        return;
      }

      const endpoint = isReviewer
        ? 'http://localhost:3000/applications'
        : `http://localhost:3000/applications/user/${encodeURIComponent(userEmail ?? '')}`;

      const appRes = await this.http.get<any>(endpoint, { headers }).toPromise();
      const sourceData = (
        Array.isArray(appRes?.data) ? appRes.data : Array.isArray(appRes) ? appRes : []
      ) as any[];

      if (isReviewer) {
        this.rawApplications.set(sourceData as ApplicationRecord[]);
      } else {
        this.rawApplications.set(this.normalizeUserApplications(sourceData, userEmail ?? ''));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  updateStatus(applicationId: number, status: ApplicationStatus) {
    if (this.updatingId() === applicationId) return;

    const previousStatus = this.getApplicationStatus(applicationId);
    this.updatingId.set(applicationId);
    this.applyStatusUpdate(applicationId, status, false);

    this.persistStatus(applicationId, status)
      .then(() => {
        this.updatingId.set(null);
      })
      .catch((err: any) => {
        if (previousStatus) {
          this.applyStatusUpdate(applicationId, previousStatus, false);
        }
        this.updatingId.set(null);
        console.error('No fue posible actualizar el estado en backend', err);
        alert(err?.error?.message || 'No se pudo guardar el estado en servidor.');
      });
  }

  private async persistStatus(applicationId: number, status: ApplicationStatus): Promise<void> {
    const headers = this.getHeaders();
    const baseUrls = ['http://localhost:3000', 'http://localhost:3000/api/v1'];
    const requests: Array<{ method: 'PATCH' | 'PUT'; url: string; body?: unknown }> = [];

    for (const baseUrl of baseUrls) {
      requests.push(
        {
          method: 'PATCH',
          url: `${baseUrl}/applications/${applicationId}/status`,
          body: { status },
        },
        {
          method: 'PATCH',
          url: `${baseUrl}/applications/${applicationId}/status`,
          body: { applicationStatus: status },
        },
        { method: 'PATCH', url: `${baseUrl}/applications/${applicationId}`, body: { status } },
        {
          method: 'PATCH',
          url: `${baseUrl}/applications/${applicationId}`,
          body: { applicationStatus: status },
        },
        {
          method: 'PATCH',
          url: `${baseUrl}/applications/${applicationId}/status/${status}`,
        },
        {
          method: 'PATCH',
          url: `${baseUrl}/applications/${applicationId}?status=${status}`,
        },
      );
    }

    let lastError: any = null;

    for (const request of requests) {
      try {
        await firstValueFrom(
          this.http.request(request.method, request.url, {
            body: request.body,
            headers,
          }),
        );
        return;
      } catch (error: any) {
        lastError = error;
        if (this.shouldTryNextStatusStrategy(error)) {
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('No endpoint available to update status');
  }

  private shouldTryNextStatusStrategy(error: any): boolean {
    const statusCode = Number(error?.status ?? 0);
    if (statusCode === 404 || statusCode === 405) {
      return true;
    }

    if (statusCode !== 400) {
      return false;
    }

    const messages = Array.isArray(error?.error?.message)
      ? error.error.message
      : [error?.error?.message ?? ''];
    const normalized = messages.map((message: unknown) => String(message).toLowerCase());

    return normalized.some(
      (message: string) =>
        message.includes('property status should not exist') ||
        message.includes('property applicationstatus should not exist'),
    );
  }

  private applyStatusUpdate(
    applicationId: number,
    status: ApplicationStatus,
    clearUpdating = true,
  ) {
    this.rawApplications.update((apps) =>
      apps.map((app) =>
        Number(app.idApplication) === Number(applicationId) ? { ...app, status } : app,
      ),
    );

    if (clearUpdating) {
      this.updatingId.set(null);
    }
  }

  private getApplicationStatus(applicationId: number): ApplicationStatus | null {
    const app = this.rawApplications().find(
      (current) => Number(current.idApplication) === Number(applicationId),
    );
    return app?.status ?? null;
  }

  private normalizeUserApplications(data: any[], userEmail: string): ApplicationRecord[] {
    return data.map((item, index) => {
      const vacancyId = Number(item?.vacancyId ?? item?.idVacancy ?? item?.id ?? 0);
      const fallbackId = vacancyId > 0 ? vacancyId : index + 1;

      return {
        idApplication: Number(item?.idApplication ?? fallbackId),
        appliedAt: item?.appliedAt ?? new Date().toISOString(),
        status: (item?.status as ApplicationStatus) ?? ApplicationStatus.PENDING,
        userId: item?.userId,
        userEmail,
        vacancyId,
      };
    });
  }

  statusLabel(status: ApplicationStatus): string {
    if (status === ApplicationStatus.PENDING) return 'En espera';
    if (status === ApplicationStatus.ACCEPTED) return 'Aceptado';
    return 'Rechazado';
  }

  private getHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
