import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  readonly API_URL = 'http://localhost:3000';
  private readonly registerPaths = [
    '/users',
    '/auth/register',
    '/api/v1/users',
    '/api/v1/auth/register',
  ];
  private http = inject(HttpClient);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);

  onRegister(formData: any) {
    console.log('Form Data:', formData);
    this.errorMessage.set(null);
    this.registerWithFallback(formData, 0);
  }

  private registerWithFallback(formData: any, index: number) {
    if (index >= this.registerPaths.length) {
      this.errorMessage.set('No se encontró endpoint de registro disponible en el backend.');
      return;
    }

    const endpoint = `${this.API_URL}${this.registerPaths[index]}`;

    this.http.post(endpoint, formData).subscribe({
      next: (response) => {
        console.log(`Registration successful on ${endpoint}:`, response);
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        const status = Number(error?.status ?? 0);

        if (status === 404) {
          this.registerWithFallback(formData, index + 1);
          return;
        }

        console.error('Registration failed:', error);
        this.errorMessage.set(error?.error?.message || 'Error al registrar el usuario.');
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
