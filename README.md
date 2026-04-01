# Vacancy Frontend Angular

Aplicación frontend desarrollada en **Angular 20** para gestionar un flujo completo de vacantes tecnológicas, con autenticación por JWT y vistas diferenciadas por roles.

## ¿Qué hace exactamente esta app?

Esta app permite:

1. **Registrar e iniciar sesión de usuarios**.
2. **Autenticar la sesión con JWT** guardado en `localStorage`.
3. **Restringir vistas por rol** (`CODER`, `GESTOR`, `ADMIN`) mediante guards de rutas.
4. **Consultar vacantes disponibles**.
5. **Postularse a vacantes** (rol `CODER`).
6. **Consultar y gestionar postulaciones**:
   - `CODER`: ve sus propias postulaciones.
   - `GESTOR`/`ADMIN`: ven todas y pueden actualizar estados.
7. **Administrar vacantes** (crear, editar, eliminar/restaurar) para `GESTOR`/`ADMIN`.
8. **Editar perfil de usuario** (nombre, correo y contraseña con validaciones).

En resumen: es un frontend de reclutamiento enfocado en vacantes TI con separación clara entre experiencia de candidato y experiencia de gestión.

## Módulos principales de la app

### 1) Login

- Inicio de sesión contra backend (`/auth/login`).
- Persistencia de token y redirección al dashboard.

### 2) Register

- Registro de nuevos usuarios.
- Implementa fallback de endpoints de registro para mayor compatibilidad con backend.

### 3) Dashboard

- Vista de accesos rápidos que cambia según el rol autenticado.

### 4) Vacancies

- Lista paginada de vacantes.
- Apertura de detalle en modal.
- Postulación directa para usuarios `CODER`.

### 5) Applications

- Lista de postulaciones enriquecidas con datos de vacante.
- Vista de “mis postulaciones” (coder) o de todas (gestor/admin).
- Gestión de estado de postulación para revisores (`GESTOR`/`ADMIN`).

### 6) Vacancies Gestor

- Panel de administración de vacantes (rol `GESTOR`/`ADMIN`).
- Crear, editar y eliminar/restaurar vacantes.

### 7) Vacancy Form

- Formulario reutilizable para crear o editar vacantes.
- Validaciones de campos y envío de payload al backend.

### 8) Edit Profile

- Edición de datos del usuario autenticado.
- Cambio de contraseña con validación de contraseña actual y confirmación.

### 9) Layout + Navegación protegida

- Sidebar y estructura general de la app privada (`/app/*`).
- Manejo de cierre de sesión.

## Roles y permisos

- **CODER**
  - Puede ver vacantes.
  - Puede postularse.
  - Puede revisar sus postulaciones.
  - Puede editar su perfil.

- **GESTOR**
  - Puede ver vacantes.
  - Puede gestionar postulaciones.
  - Puede crear/editar/eliminar vacantes.
  - Puede editar su perfil.

- **ADMIN**
  - Mismos permisos funcionales que gestor en este frontend.

## Rutas principales

### Públicas

- `/login`
- `/register`

### Privadas (bajo `/app`)

- `/app/dashboard`
- `/app/vacancies`
- `/app/vacancies-gestor`
- `/app/vacancies/create`
- `/app/vacancies/edit/:id`
- `/app/applications`
- `/app/edit-profile`

Las rutas privadas usan `roleGuard`, y las públicas de auth usan `guestGuard`.

## Arquitectura técnica (frontend)

- **Framework:** Angular 20 (standalone components)
- **Lenguaje:** TypeScript
- **Estado local/reactividad:** Angular Signals (`signal`, `computed`, `effect`)
- **HTTP:** `HttpClient`
- **Autenticación:** JWT + `jwt-decode`
- **Estilos/UI:** CSS por componente
- **Servidor de desarrollo:** Angular CLI (`ng serve`)

## Integración con backend

La app consume una API REST en:

`http://localhost:3000`

Endpoints utilizados desde frontend (ejemplos):

- `POST /auth/login`
- `POST /users` / `POST /auth/register` (fallback)
- `GET /vacancies`
- `GET /vacancies/all`
- `POST /vacancies`
- `PATCH /vacancies/:id`
- `DELETE /vacancies/:id`
- `POST /applications`
- `GET /applications`
- `GET /applications/user/:email`
- `GET /users/:id`
- `PATCH /users/:id`

## Estructura del proyecto

```text
vacancy-frontend-angular/
├─ README.md
└─ app-front/
   ├─ src/app/
   │  ├─ login/
   │  ├─ register/
   │  ├─ dashboard/
   │  ├─ vacancies/
   │  ├─ vacancies-gestor/
   │  ├─ vacancy-form/
   │  ├─ applications/
   │  ├─ edit-profile/
   │  ├─ guards/
   │  ├─ services/
   │  └─ app.routes.ts
   └─ package.json
```

## ¿Cómo ejecutar el frontend?

1. Instala dependencias:

```bash
npm install
```

2. Inicia el servidor de desarrollo:

```bash
npm start
```

3. Abre:

`http://localhost:4200`

> Nota: necesitas tener el backend corriendo en `http://localhost:3000` para que los módulos funcionen correctamente.

## Estado actual

Proyecto funcional para:

- autenticación,
- exploración y gestión de vacantes,
- postulaciones,
- y edición de perfil,

con flujo de permisos por rol implementado en frontend.
