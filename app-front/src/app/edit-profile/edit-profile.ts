import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private fb = inject(FormBuilder);

  profileForm: FormGroup;
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  message = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Variable para guardar el estado original y saber qué cambió
  private initialValues: { fullname: string; email: string } = { fullname: '', email: '' };

  constructor() {
    this.profileForm = this.fb.group(
      {
        // Cambiado de fullName a fullname para coincidir exactamente con NestJS
        fullname: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],

        currentPassword: [''],
        newPassword: ['', [Validators.minLength(6)]],
        confirmPassword: [''],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );

    effect(() => {
      const id = this.auth.userId();
      if (id) {
        this.loadUserProfile();
      } else {
        this.profileForm.reset();
      }
    });
  }

  ngOnDestroy() {
    this.profileForm.reset();
    this.message.set(null);
  }

  loadUserProfile() {
    const userId = this.auth.userId();
    if (!userId) return;

    this.isLoading.set(true);
    const headers = this.getHeaders().set('Cache-Control', 'no-cache');

    this.http.get<any>(`http://localhost:3000/users/${userId}`, { headers }).subscribe({
      next: (res) => {
        const userData = res.data;

        this.initialValues = {
          fullname: userData.fullname,
          email: userData.email,
        };

        this.profileForm.patchValue(this.initialValues);
        this.isLoading.set(false);
      },
      error: () => {
        this.message.set({ type: 'error', text: 'No se pudo cargar la información del perfil.' });
        this.isLoading.set(false);
      },
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (!newPassword && !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    const formValue = this.profileForm.value;
    const payload: any = {};
    const changedFields: string[] = [];

    // 1. Verificar qué datos de texto cambiaron
    if (formValue.fullname !== this.initialValues.fullname) {
      payload.fullname = formValue.fullname;
      changedFields.push('Nombre Completo');
    }

    if (formValue.email !== this.initialValues.email) {
      payload.email = formValue.email;
      changedFields.push('Correo Electrónico');
    }

    // 2. Verificar la lógica de contraseñas
    const isChangingPassword = formValue.newPassword || formValue.confirmPassword;

    if (isChangingPassword) {
      if (!formValue.currentPassword) {
        this.message.set({
          type: 'error',
          text: 'Debes ingresar tu contraseña actual para actualizarla.',
        });
        return;
      }

      if (this.profileForm.errors?.['passwordMismatch']) {
        this.message.set({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' });
        return;
      }

      // Añadimos al payload para que NestJS valide la actual y actualice por la nueva
      payload.currentPassword = formValue.currentPassword;
      payload.password = formValue.newPassword; // Tu entidad en NestJS espera 'password'
      changedFields.push('Contraseña');
    }

    // 3. Validar si realmente hay cambios que guardar
    if (Object.keys(payload).length === 0) {
      this.message.set({ type: 'error', text: 'No has realizado ningún cambio en tu perfil.' });
      return;
    }

    // 4. Mostrar alerta de confirmación con los campos afectados
    const confirmMessage = `Estás a punto de actualizar los siguientes datos:\n\n- ${changedFields.join('\n- ')}\n\n¿Estás seguro de continuar?`;
    if (!window.confirm(confirmMessage)) {
      return; // Detenemos la ejecución si el usuario cancela
    }

    // 5. Enviar solo el payload con lo que cambió
    this.isSaving.set(true);
    const userId = this.auth.userId();
    const headers = this.getHeaders();

    this.http.patch(`http://localhost:3000/users/${userId}`, payload, { headers }).subscribe({
      next: () => {
        this.message.set({ type: 'success', text: '¡Perfil actualizado correctamente!' });
        this.isSaving.set(false);

        // Actualizamos nuestro estado inicial para futuras ediciones
        if (payload.fullname) this.initialValues.fullname = payload.fullname;
        if (payload.email) this.initialValues.email = payload.email;

        // Limpiar contraseñas después de guardar con éxito
        this.profileForm.patchValue({ currentPassword: '', newPassword: '', confirmPassword: '' });

        setTimeout(() => this.message.set(null), 3000);
      },
      error: (err) => {
        this.message.set({
          type: 'error',
          text: err.error?.message || 'Error al actualizar el perfil.',
        });
        this.isSaving.set(false);
      },
    });
  }

  private getHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
