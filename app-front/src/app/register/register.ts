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
  private http = inject(HttpClient);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);

  onRegister(formData: any) {
    console.log('Form Data:', formData);

    this.http.post(`${this.API_URL}/auth/register`, formData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.errorMessage.set('Error al registrar el usuario.');
      }
    });

  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
