import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private router = inject(Router);
    private auth = inject(Auth);

  isSidebarOpen = signal(true);

  toggleSidebar() {
    this.isSidebarOpen.update(state => !state);
  }

  logout() {
    this.auth.logout();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
