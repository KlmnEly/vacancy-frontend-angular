import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { MyTokenPayload } from './tokenPayload.interface';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private platformId = inject(PLATFORM_ID); 
  private tokenPayload = signal<MyTokenPayload | null>(null);

  constructor() {
    this.loadToken();
  }

  loadToken() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<MyTokenPayload>(token);
          this.tokenPayload.set(decoded);
        } catch (error) {
          console.error('Token inválido');
          this.tokenPayload.set(null);
        }
      }
    }
  }

  userId = computed(() => this.tokenPayload()?.sub ?? null);
  
  isAuthenticated = computed(() => this.tokenPayload() !== null);

  logout() {
    localStorage.removeItem('token');
    this.loadToken();
  }

  role = computed(() => this.tokenPayload()?.role ?? null);

  isTokenExpired(): boolean {
    const payload = this.tokenPayload();
    if (!payload) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }
}
