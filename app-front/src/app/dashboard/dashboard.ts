import { NgFor } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

interface DashboardShortcut {
  title: string;
  subtitle: string;
  route: string;
  iconKey: 'vacancies' | 'applications' | 'profile' | 'manager';
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgFor],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private auth = inject(Auth);

  shortcuts = computed<DashboardShortcut[]>(() => {
    const role = (this.auth.role() ?? '').toUpperCase();

    if (role === 'CODER') {
      return [
        {
          title: 'Vacantes',
          subtitle: 'Explora ofertas y aplica',
          route: '/app/vacancies',
          iconKey: 'vacancies',
        },
        {
          title: 'Postulaciones',
          subtitle: 'Revisa el estado de tus aplicaciones',
          route: '/app/applications',
          iconKey: 'applications',
        },
        {
          title: 'Editar Perfil',
          subtitle: 'Actualiza tus datos personales',
          route: '/app/edit-profile',
          iconKey: 'profile',
        },
      ];
    }

    return [
      {
        title: 'Vacantes',
        subtitle: 'Consulta ofertas disponibles',
        route: '/app/vacancies',
        iconKey: 'vacancies',
      },
      {
        title: 'Aplicaciones',
        subtitle: 'Gestiona estados de postulaciones',
        route: '/app/applications',
        iconKey: 'applications',
      },
      {
        title: 'Editar Perfil',
        subtitle: 'Modifica información de cuenta',
        route: '/app/edit-profile',
        iconKey: 'profile',
      },
      {
        title: 'Gestor de Vacantes',
        subtitle: 'Administra y publica vacantes',
        route: '/app/vacancies-gestor',
        iconKey: 'manager',
      },
    ];
  });
}
