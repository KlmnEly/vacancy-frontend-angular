import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Dashboard } from './dashboard/dashboard';
import { Layout } from './layout/layout';
import { Vacancies } from './vacancies/vacancies';
import { Applications } from './applications/applications';
import { EditProfile } from './edit-profile/edit-profile';
import { roleGuard } from './guards/role-guard';
import { VacanciesGestor } from './vacancies-gestor/vacancies-gestor';
import { VacancyForm } from './vacancy-form/vacancy-form';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },

  {
    path: 'app',
    component: Layout,
    canActivate: [roleGuard],
    canActivateChild: [roleGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        data: { roles: ['CODER', 'ADMIN', 'GESTOR'] },
      },
      {
        path: 'vacancies',
        component: Vacancies,
        data: { roles: ['CODER', 'ADMIN', 'GESTOR'] },
      },
      {
        path: 'vacancies-gestor',
        component: VacanciesGestor,
        data: { roles: ['GESTOR', 'ADMIN'] },
      },
      {
        path: 'applications',
        component: Applications,
        data: { roles: ['CODER', 'ADMIN', 'GESTOR'] },
      },
      {
        path: 'edit-profile',
        component: EditProfile,
        data: { roles: ['CODER', 'ADMIN', 'GESTOR'] },
      },
      {
        path: 'vacancies/create',
        component: VacancyForm,
        data: { roles: ['GESTOR', 'ADMIN'] },
      },
      {
        path: 'vacancies/edit/:id',
        component: VacancyForm,
        data: { roles: ['GESTOR', 'ADMIN'] },
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '', redirectTo: '/app/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/app/dashboard' },
];
