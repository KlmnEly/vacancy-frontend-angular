import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly API_URL = 'http://localhost:3000';

  constructor (private http: HttpClient, private router: Router) {}

  onLogin (formData: any) {
      this.http.post(`${this.API_URL}/auth/login`, formData).subscribe({
        next: (res: any) => {
          console.log('Login successful:', res);
          localStorage.setItem('token', res.token);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => alert('Error en el inicio de sesion')
      });
  }
}
