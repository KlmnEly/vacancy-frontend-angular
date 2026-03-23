import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly API_URL = 'http://localhost:3000';
  private auth = inject(Auth);

  constructor (private http: HttpClient, private router: Router) {}

  onLogin (formData: any) {
      this.http.post(`${this.API_URL}/auth/login`, formData).subscribe({
        next: (res: any) => {
          console.log('Login successful:', res);
          localStorage.setItem('token', res.data.user_token);

          this.auth.loadToken();
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => alert('Error en el inicio de sesion')
      });
  }
}
