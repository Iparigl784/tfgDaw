# Meetng — Documentación técnica

---

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Endpoints de la API](#4-endpoints-de-la-api)
5. [Flujos funcionales clave](#5-flujos-funcionales-clave)
6. [Estructura del frontend](#6-estructura-del-frontend)
7. [Estructura del backend](#7-estructura-del-backend)
8. [Escalabilidad y reusabilidad](#8-escalabilidad-y-reusabilidad)
9. [Seguridad y permisos](#9-seguridad-y-permisos)
10. [Funcionalidades destacadas](#10-funcionalidades-destacadas)
11. [Mejoras y propuestas futuras](#12-mejoras-y-propuestas-futuras)

---

Plataforma web para coordinar reuniones y encuestas entre usuarios. El sistema permite proponer fechas, votar entre opciones, gestionar asistencia y mantener un historial unificado de invitaciones.

## 1. Arquitectura general

Aplicación cliente/servidor con separación estricta:

- **Backend** (`meetng-app/`): API REST en Laravel, autenticación con Sanctum (Bearer token), persistencia en MySQL/MariaDB.
- **Frontend** (`frontend/`): SPA en React + Vite. Consume la API por HTTP/JSON con `fetch` nativo. Token en `localStorage`.

```
┌─────────────────────┐     HTTPS/JSON      ┌────────────────────────┐
│   React + Vite      │ ◄────────────────►  │   Laravel + Sanctum    │
│   (SPA cliente)     │                     │   (API REST)           │
│                     │   Bearer token      │                        │
│   localStorage      │                     │   MySQL/MariaDB        │
└─────────────────────┘                     └────────────────────────┘
```

No hay rutas Blade ni server-side rendering: el backend es 100 % API, el frontend es 100 % JS.

---

## 2. Stack tecnológico

### Backend (`meetng-app/`)

| Componente | Tecnología | Uso |
|---|---|---|
| Lenguaje | PHP 8.2+ | — |
| Framework | Laravel 11.x | Estructura, routing, ORM, validación |
| ORM | Eloquent | Modelos relacionales |
| Autenticación | Laravel Sanctum | Tokens API stateless |
| Validación | FormRequest | `StoreReunionRequest`, `StoreEncuestaRequest`, etc. |
| Autorización | Policies + Gates | `ReunionPolicy`, `EncuestaPolicy`, `AsistentePolicy` |
| Capa de servicios | Custom `App\Services\*` | `ReunionService`, `EncuestaService`, `AsistenteService`, `DestinatarioService` |
| Comandos programados | Artisan Console | `ExpirarEncuestas`, `CerrarEncuestas` |
| Base de datos | MySQL / MariaDB | Tablas relacionales |
| Tests | PHPUnit | Pendiente de ampliar |

### Frontend (`frontend/`)

| Componente | Tecnología | Versión / nota |
|---|---|---|
| Lenguaje | JavaScript (sin TypeScript) | ES2022 |
| Framework | React | 18.x |
| Bundler / dev server | Vite | 5.x — HMR rápido, build a `dist/` |
| Routing | `react-router-dom` | v6 nested layouts |
| HTTP | `fetch` nativo + hook `useFetch` | Sin axios ni react-query |
| Notificaciones | `react-toastify` | Toasts globales |
| Iconos | `@iconify/react` | Iconos vectoriales bajo demanda (mdi:*) |
| Fechas | `dayjs` | Formateo y parsing |
| Estilo | CSS Modules + CSS Nesting nativo | Sin SCSS, sin Tailwind |
| Estado global | React Context (`AuthContext`) | Sin Redux/Zustand |
| Persistencia local | `localStorage` | Solo el token JWT |

### Tipografía y branding

- Fuentes: **Oooh Baby** (acentos), **Inter** (cuerpo).
- Colores corporativos: `#407338` (verde primario), `#F2F2F2` (fondo).
- Diseño basado en tarjetas (no tablas). Mobile-first. Textos en español.

---

## 3. Modelo de datos

### Entidades principales

```
User                Rol
 ├ id               ├ id
 ├ name             ├ slug      (admin | user)
 ├ email            └ nombre
 ├ password
 └ rol_id ─────────►┘

Reunion             OpcionEncuesta       Encuesta
 ├ id               ├ id                 ├ id
 ├ titulo           ├ fecha_inicio       ├ titulo
 ├ descripcion      ├ fecha_fin          ├ descripcion
 ├ lugar            ├ estado             ├ tipo  (generica | reunion)
 ├ fecha_inicio     ├ encuesta_id ──────►├ estado  (activa | expirada | cerrada)
 ├ fecha_fin        └ user_id            ├ fecha_limite
 ├ estado                                ├ reunion_id ─────► Reunion
 │  (pendiente_encuesta | programada                         (1:0..1)
 │   | cancelada | realizada)            └ user_id
 ├ opcion_encuesta_id ─► OpcionEncuesta
 └ user_id

Asistente                          Destinatario
 ├ id                              ├ id
 ├ nombre                          ├ encuesta_id ──► Encuesta
 ├ email                           └ user_id     ──► User
 ├ estado
 │  (pendiente | confirmado
 │   | no_asistido)
 ├ reunion_id ──► Reunion
 └ user_id    ──► User

RespuestaEncuesta
 ├ id
 ├ opcion_encuesta_id ──► OpcionEncuesta
 ├ encuesta_id        ──► Encuesta
 ├ user_id            ──► User
 └ respuesta  (si | no)
```

### Relaciones clave

- Una **Reunión** puede o no tener una **Encuesta** asociada:
  - Reunión simple (una fecha) → sin encuesta. Los invitados son **Asistentes** directos.
  - Reunión multi-fecha → se crea una **Encuesta** con varias **OpcionEncuesta**. Los invitados son **Destinatarios** que votan.
- Al cerrar la encuesta, la opción ganadora pasa a `estado='aceptada'`, el resto a `'rechazada'`, y los votantes con respuesta `'si'` se convierten en **Asistentes** confirmados.
- Un usuario puede ser creador de muchas reuniones/encuestas (`hasMany`) y destinatario/asistente de otras tantas.

### Estados y máquinas

**Reunion.estado**
```
   pendiente_encuesta ──► (cierre encuesta) ──► programada ──► realizada
                                                    │
                                                    └─► cancelada
```

**Encuesta.estado**
```
   activa ──► (cierre manual o auto) ──► cerrada
        └──► (fecha_limite superada) ──► expirada
```

**Asistente.estado**
```
   pendiente ──► confirmado
            └─► no_asistido
```

---

## 4. Endpoints de la API

Todas las rutas bajo `/api/`. Las protegidas requieren `Authorization: Bearer <token>`.

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/login` | Autenticar email/password → devuelve token |
| POST | `/register` | Registrar usuario (admin crea otros usuarios) |
| GET | `/me` | Datos del usuario autenticado |
| POST | `/logout` | Invalidar token |

### Usuarios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/usuarios` | Listar (admin: todos; user: solo `rol=user`). Acepta `?page`, `?per_page`, `?search` |
| GET | `/usuarios/{id}` | Detalle |
| PUT | `/usuarios/{id}` | Actualizar perfil |
| PUT | `/usuarios/{id}/password` | Cambiar contraseña |
| PUT | `/usuarios/{id}/rol` | Cambiar rol (admin only) |
| DELETE | `/usuarios/{id}` | Eliminar |

### Reuniones

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/reuniones` | Listar (con filtros `estado`, `desde`, `hasta`) |
| POST | `/reuniones` | Crear (1 fecha: simple + asistentes pendientes; 2+: crea encuesta + destinatarios) |
| GET | `/reuniones/{id}` | Detalle con asistentes, encuesta, destinatarios |
| PUT | `/reuniones/{id}` | Actualizar (bloqueado si estado ∈ {pendiente_encuesta, cancelada, realizada}) |
| DELETE | `/reuniones/{id}` | Eliminar (creador: solo si !=realizada; admin: siempre) |
| GET | `/mis-reuniones` | Reuniones creadas por mí |
| GET | `/mis-asistencias` | Reuniones donde soy asistente confirmado |

### Asistentes

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/reuniones/{r}/asistentes` | Listar asistentes |
| POST | `/reuniones/{r}/asistentes` | Añadir uno (`firstOrCreate`) |
| PUT | `/reuniones/{r}/asistentes` | Sync de pendientes (no toca confirmados/rechazados) |
| DELETE | `/reuniones/{r}/asistentes/{a}` | Eliminar (bloqueado si reunión cancelada/realizada) |
| POST | `/asistentes/{a}/confirmar` | El invitado confirma |
| POST | `/asistentes/{a}/rechazar` | El invitado rechaza |

### Encuestas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/encuestas` | Listar |
| POST | `/encuestas` | Crear (acepta `destinatarios: [emails]`) |
| GET | `/encuestas/{id}` | Detalle con opciones, destinatarios, reunión asociada |
| PUT | `/encuestas/{id}` | Actualizar (bloqueado si `cerrada`) |
| DELETE | `/encuestas/{id}` | Eliminar (creador: solo si quedan >24h; admin: siempre) |
| POST | `/encuestas/{id}/cerrar` | Cerrar manualmente → marca ganadora + crea asistentes |
| GET | `/mis-encuestas` | Encuestas creadas por mí |

### Opciones y votos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/encuestas/{e}/opciones` | Listar opciones |
| GET | `/encuestas/{e}/votos` | Todos los votos (creador/admin) |
| POST | `/encuestas/{e}/votos` | Emitir/cambiar voto |
| PUT | `/encuestas/{e}/votos` | Actualizar voto |
| GET | `/encuestas/{e}/mis-votos` | Mis votos (creador o destinatario) |
| GET | `/encuestas/{e}/resultados` | Recuentos agregados |

### Destinatarios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/encuestas/{e}/destinatarios` | Listar |
| POST | `/encuestas/{e}/destinatarios` | Añadir uno (por user_id) |
| PUT | `/encuestas/{e}/destinatarios` | Sync completo (lista de user_ids) |
| DELETE | `/encuestas/{e}/destinatarios/{d}` | Eliminar |

### Invitaciones (vista unificada)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/invitaciones` | Encuestas + reuniones donde el usuario es destinatario/asistente. Cada item: `{ tipo, id, recurso_id, asistente_id, ha_votado, estado, fecha, usuario }` |

---

## 5. Flujos funcionales clave

### A. Crear reunión simple (1 fecha)

```
Usuario → ReunionForm (1 fecha + emails)
       → POST /reuniones  body: { fechas: [...], asistentes: [emails] }
       → ReunionService::alta()
         ├ crea Reunion estado=programada
         └ por cada email: Asistente firstOrCreate con estado=pendiente
       → 201 Created
```

### B. Crear reunión con encuesta (2+ fechas)

```
Usuario → ReunionForm (2+ fechas + emails)
       → POST /reuniones  body: { fechas: [...], destinatarios: [emails] }
       → ReunionService::alta()
         ├ crea Reunion estado=pendiente_encuesta
         ├ crea Encuesta estado=activa + OpcionEncuesta[] (una por fecha)
         └ por cada email: Destinatario firstOrCreate en la encuesta
       → 201 Created
```

### C. Ciclo completo de una encuesta de reunión

```
1. Creación
   └ Reunion + Encuesta + Opciones + Destinatarios

2. Votación
   └ Cada destinatario: POST /encuestas/{e}/votos {opcion_id, respuesta}
     (puede cambiar el voto mientras la encuesta esté activa)

3. Cierre (manual o auto por comando ExpirarEncuestas)
   └ EncuestaService::cerrarEncuesta()
     ├ opción más votada (sí) → estado=aceptada
     ├ resto opciones → estado=rechazada
     ├ Encuesta.estado = cerrada
     ├ Reunion.fecha_inicio/fin = opción ganadora
     ├ Reunion.estado = programada
     └ por cada votante con "sí": Asistente firstOrCreate confirmado

4. Día de la reunión → estado=realizada (manual o por scheduler)
```

### D. Flujo de invitación a un asistente

```
1. Creador añade asistente con email → POST /reuniones/{r}/asistentes
   → Asistente estado=pendiente

2. Invitado entra a /mis-invitaciones
   → GET /invitaciones devuelve la invitación con estado=pendiente
   → ReunionInvCard ofrece "Confirmar" / "Rechazar"

3. POST /asistentes/{a}/confirmar  o  /rechazar
   → estado pasa a confirmado | no_asistido
   → la card desaparece de /mis-invitaciones (filtrada por estado=pendiente)
```

### E. Restricciones de eliminación

| Recurso | Admin | Creador | Razón |
|---|---|---|---|
| Reunión | Siempre | Si `estado != realizada` | No se borran reuniones ya ocurridas |
| Encuesta | Siempre | Si quedan ≥ 24 h hasta `fecha_limite` | Evita borrar encuestas en curso con votos válidos |
| Asistente (manual) | Si reunión != cancelada/realizada | Igual | Evita romper confirmaciones de reuniones pasadas |

---

## 6. Estructura del frontend

```
frontend/src/
├── App.jsx                       Routing principal con BigLayout/AuthLayout
├── contexts/
│   └── AuthContext.jsx           token + user + isAdmin + login/logout
├── hooks/
│   ├── useFetch.js               apiRequest + useFetch (silent, immediate, params)
│   └── useClientPagination.js    Slicing en cliente (cuando backend no pagina)
├── routes/
│   └── ProtectedRoute.jsx        Gate de auth + adminOnly
├── services/
│   └── api.js                    Mapa central de endpoints
├── utils/
│   └── formatters.js             dayjs wrappers, toMySQL, labelEstado…
├── components/
│   ├── Common/
│   │   ├── Carousel.jsx          Scroll-snap horizontal con flechas
│   │   ├── MiniCarousel.jsx      Compact people (avatar + nombre + estado)
│   │   ├── Pagination.jsx
│   │   ├── SearchInput.jsx
│   │   └── UserPicker.jsx        Autocompletar con search local
│   ├── Filters/                  FilterBar, StateSelect, DateRange (URL-persisted)
│   ├── Forms/
│   │   ├── ReunionForm.jsx       Condicional asistentes/destinatarios según fechas.length
│   │   └── EncuestaForm.jsx
│   ├── Invitaciones/
│   │   ├── CarouselContainer.jsx Grid si ≤3, Carousel si >3
│   │   ├── EncuestaInvCard.jsx
│   │   └── ReunionInvCard.jsx
│   ├── Layout/
│   │   ├── AuthLayout.jsx        login/register full-screen
│   │   ├── BigLayout.jsx         Navbar + Outlet + Footer
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── UI/
│   │   ├── Card.jsx              variants: default | outlined | highlight | selected
│   │   ├── ConfirmDialog.jsx
│   │   └── LoadingSpinner.jsx
│   └── Users/
│       └── CrearUsuarioModal.jsx
└── pages/
    ├── Auth/           Login, Register
    ├── Encuestas/      List, MisEncuestas, Create, Edit, Show
    ├── Reuniones/      List, MisReuniones, MisAsistencias, Create, Edit, Show
    ├── Invitaciones/   List (unificada con secciones)
    ├── Inicio/
    ├── Profile/        Me
    ├── Shared/         NotFound, Loading, ConnectionError
    └── Users/          ListUsers, UserEdit
```

### Convenciones del frontend

- **Sin axios**: todo el HTTP pasa por `useFetch` / `apiRequest`. Inyección global de handlers para 401 (logout) y errores de conexión.
- **Toasts globales** vía `react-toastify`. Opción `silent` para suprimir toasts en peticiones que pueden devolver 403 esperado (ej. `mis-votos`).
- **Carga diferida** (`immediate: false`) para llamadas condicionales: ej. solo cargar `mis-votos` si el usuario es creador o destinatario.
- **CSS Modules + CSS Nesting**: cada componente puede tener su `Component.module.css`. Se usa `&` anidado nativo.
- **Sin inline styles** salvo casos puntuales (`flex: 1, minWidth` en formularios). Los nuevos componentes se diseñan ya en módulos.

---

## 7. Estructura del backend

```
meetng-app/app/
├── Console/
│   ├── Commands/
│   │   ├── ExpirarEncuestas.php   Marca encuestas vencidas como expiradas
│   │   └── CerrarEncuestas.php    Cierra encuestas y crea asistentes
│   └── Kernel.php                  Scheduler
├── Enums/
│   └── RoleSlug.php
├── Http/
│   ├── Controllers/Api/           Controladores REST (uno por recurso)
│   ├── Middleware/RoleMiddleware  Restricción admin
│   ├── Requests/                  StoreXxxRequest / UpdateXxxRequest
│   └── Resources/                 XxxResource (transforma Eloquent → JSON)
├── Models/                        Reunion, Encuesta, OpcionEncuesta,
│                                  Asistente, Destinatario, RespuestaEncuesta,
│                                  User, Rol
├── Policies/                      ReunionPolicy, EncuestaPolicy, AsistentePolicy, UserPolicy
└── Services/                      Lógica de negocio (delgados controllers)
    ├── ReunionService.php         alta() crea reunión + encuesta + destinatarios/asistentes
    ├── EncuestaService.php        alta() + cerrarEncuesta() con tx
    ├── AsistenteService.php       crear, syncPendientes, confirmar, rechazar
    ├── DestinatarioService.php    asignar, asignarVarios, syncDestinatarios
    ├── OpcionEncuestaService.php
    ├── RespuestaEncuestaService.php
    └── UserService.php
```

### Convenciones del backend

- **Capa de servicios obligatoria**: los Controllers solo orquestan auth + validación + Resource. Toda la lógica (`firstOrCreate`, transacciones, generación de encuestas, etc.) vive en `Services/`.
- **Policies por recurso**: cualquier acción sensible (`update`, `delete`, `cerrar`, `asignarDestinatarios`, `verAsistentes`, `responderInvitacion`, etc.) pasa por una Policy.
- **Resources tipados**: cada respuesta JSON pasa por `XxxResource`. Usan `whenLoaded()` para no devolver relaciones no cargadas y `when()` para campos condicionales.
- **Transacciones** (`DB::transaction(...)`) en operaciones multi-tabla: creación de reunión + encuesta, cierre + creación de asistentes.

---

## 8. Escalabilidad y reusabilidad

### Backend

- **Pattern Controller → FormRequest → Service → Resource** mantiene el código fácil de extender. Añadir un nuevo recurso significa 4 archivos pequeños sin tocar el resto.
- **Capa de servicios** desacopla la lógica del transporte HTTP: se puede llamar desde un comando Artisan, un job de cola o un test sin modificación.
- **Eloquent scopes** (`scopeDelUsuario`, `scopeOrdenadas`, `scopeRecientes`) permiten composición de consultas sin duplicar filtros.
- **Paginación nativa de Laravel** (`paginate(9)`): devuelve `meta` y `links` listos para el frontend.

### Frontend

| Componente | Reusos actuales |
|---|---|
| `useFetch` | Todas las páginas y modales (decenas de instancias) |
| `apiRequest` | Toda operación de escritura (POST/PUT/DELETE) |
| `Card` | Listados, fichas, secciones de detalle, invitaciones, formularios |
| `Carousel` | `MiniCarousel` y `CarouselContainer` lo envuelven con threshold |
| `MiniCarousel` | Asistentes y destinatarios en Reuniones/Show y Encuestas/Show |
| `CarouselContainer` | Secciones de `MisInvitaciones` (encuestas y reuniones) |
| `UserPicker` | Selector reutilizable de usuarios con search local |
| `ConfirmDialog` | Cualquier acción destructiva |
| `FilterBar` | Listados con filtros (`Reuniones`, `Encuestas`, `MisReuniones`, `MisEncuestas`) |
| `Pagination` | Todos los listados paginados |

### Patrones que facilitan crecer

- **Endpoints centralizados** en `services/api.js`: cambiar la URL de un recurso es una sola línea.
- **Threshold parametrizable** en carruseles: la regla "3 items → grid, más → carrusel" es un único prop.
- **`apiRequest` con `silent`**: las llamadas con 403 esperado no rompen UX. Reutilizable para cualquier endpoint condicional.
- **Forms desacoplados** (`ReunionForm`, `EncuestaForm`): los page Create/Edit son wrappers triviales. Añadir un campo o validación nuevo no rompe nada.
- **`AsistenteService::syncPendientes()`** y **`DestinatarioService::syncDestinatarios()`**: operaciones de sync atómicas que no rompen votos/confirmaciones previas.

---

## 9. Seguridad y permisos

### Autenticación

- Tokens **Sanctum** con expiración configurable.
- Token almacenado en `localStorage`. En cada request, header `Authorization: Bearer <token>`.
- `useFetch` instala un `unauthorizedHandler` global: ante 401, limpia sesión y redirige a `/login`.

### Autorización (Policies)

| Policy | Reglas clave |
|---|---|
| `EncuestaPolicy::update` | Creador o admin, y `estado != cerrada` |
| `EncuestaPolicy::cerrar` | Creador o admin, y `estado != cerrada` |
| `EncuestaPolicy::delete` | Admin siempre; creador solo si quedan ≥ 24 h hasta `fecha_limite` |
| `EncuestaPolicy::asignarDestinatarios` | Creador o admin, y `estado != cerrada` |
| `EncuestaPolicy::votar` | Admin / creador / destinatario, y `estado == activa` |
| `EncuestaPolicy::verMisVotos` | Creador o destinatario (admin solo si es uno de los dos) |
| `ReunionPolicy::update` | Creador o admin |
| `ReunionPolicy::delete` | Admin siempre; creador solo si `estado != realizada` |
| `ReunionPolicy::verAsistentes` | Admin / creador / asistente |
| `AsistentePolicy::responderInvitacion` | El propio asistente |
| `UserPolicy::viewAny` | Cualquier autenticado (el controller filtra: user normal ve solo `rol=user`) |

### Defensa en profundidad

- **Frontend** oculta botones cuando una acción no procede (mejor UX).
- **Backend** valida con Policies → si alguien fuerza la petición (cURL, devtools), recibe 403.
- **FormRequests** validan tipos, formato, existencia de relaciones (`exists:users,email`).
- **No se exponen IDs internos** en URLs públicas: todo recurso pasa por la Policy.

---

## 10. Funcionalidades destacadas

### Creación inteligente de reuniones

Un único formulario produce dos flujos:
- **1 fecha** → reunión simple con asistentes pendientes.
- **2+ fechas** → reunión con encuesta auto-creada y destinatarios para votar.

El label del fieldset y el campo del payload (`asistentes` vs `destinatarios`) se ajustan dinámicamente.

### Vista unificada "Mis invitaciones"

Un único endpoint (`GET /invitaciones`) devuelve encuestas y reuniones donde el usuario está pendiente. La UI divide en dos secciones (Encuestas por votar / Reuniones por confirmar) con carrusel adaptativo cuando hay más de 3 items.

### Carrusel adaptativo

`CarouselContainer` y `MiniCarousel` deciden automáticamente entre grid (≤ 3) y scroll horizontal con snap (> 3). Las flechas aparecen solo cuando hay scroll disponible.

### Restricciones de eliminación contextual

- Encuestas no se pueden eliminar a < 24 h de la fecha límite (preserva votos).
- Reuniones realizadas no se pueden eliminar (preserva histórico).
- Asistentes no se pueden eliminar si la reunión está cancelada/realizada.
- Avisos claros explican al usuario por qué un botón no aparece.

### Edición add-only

En `EditEncuesta` y `EditReunion`, los destinatarios/asistentes existentes son **read-only** (no se rompen votos ni confirmaciones). Solo se pueden AÑADIR nuevos vía POST. El backend usa `firstOrCreate` para idempotencia.

### Cierre de encuesta con propagación

Al cerrar una encuesta:
1. Se marca la opción más votada (sí) como ganadora.
2. La reunión asociada actualiza `fecha_inicio`/`fecha_fin` y pasa a `programada`.
3. Los votantes con "sí" se convierten automáticamente en Asistentes confirmados.

Una sola transacción → consistencia garantizada.

### Permisos diferenciados creador/admin/destinatario

- Creador: gestión completa de su recurso (excepto las restricciones temporales/de estado).
- Admin: gestión completa siempre.
- Destinatario: solo votación.
- Asistente: solo confirmar/rechazar su propia invitación.

---

## 11. Mejoras y propuestas futuras

### 11.1. Enlace único por reunión

**Descripción**. Cada reunión generaría un slug/token único (`reunion.slug = bin2hex(random_bytes(16))`) accesible vía `GET /r/{slug}` sin autenticación. El destinatario abriría el enlace y vería la reunión con opción de confirmar/rechazar/votar sin registrarse.

**Cambios necesarios**:
- Migración: añadir columna `slug` único a `reuniones`.
- Modelo: generar slug en `creating` event.
- Nuevo controller público `PublicReunionController` con rutas fuera del middleware `auth:sanctum`.
- Frontend: ruta nueva `/r/:slug` que carga la reunión y muestra UI simplificada.
- Token de invitación efímero por destinatario (ej. UUID firmado) para acciones de votar/confirmar sin login.

**Casos de uso**: invitar a personas externas sin obligarlas a crear cuenta. Compartir por email/WhatsApp.

### 11.2. Rol de usuario anónimo y usuario premium

**Descripción**. Ampliar `roles` a 4 niveles:

| Rol | Permisos |
|---|---|
| `anonimo` | Solo accede vía enlace único. No crea recursos. Vota/confirma. |
| `user` | Estado actual: crea reuniones simples, encuestas básicas. |
| `premium` | Funcionalidades avanzadas (ver 12.6). |
| `admin` | Sin restricciones. |

**Cambios necesarios**:
- Tabla `roles`: añadir `anonimo` y `premium` con sus permisos.
- Policies: añadir checks `if ($user->rol->slug === 'premium')` donde proceda.
- Modelo `User`: nullable email/password para anónimos (solo identificados por token).
- Frontend: nuevo flag `isPremium` en `useAuth`. Componente `<PremiumBadge />`.

### 11.3. Sincronización con Google Calendar

**Descripción**. Al crear una reunión `programada`, ofrecer "Añadir a Google Calendar" — vía OAuth 2.0 + Google Calendar API.

**Cambios necesarios**:
- Composer: `google/apiclient` o `revolution/laravel-google-calendar`.
- Tabla `oauth_tokens` por usuario con `provider='google'`.
- Migración: añadir `google_event_id` a `reuniones` para sincronización bidireccional.
- Service `GoogleCalendarService`:
  - `pushReunion(Reunion $r)`: crea evento en Google.
  - `pullChanges(User $u)`: webhook para sync de cambios externos.
- Frontend: botón "Conectar con Google" en `/me`. Indicador "Sincronizada con Calendar" en cada reunión.
- Configuración: `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env`.

**Caso límite**: si el usuario actualiza la reunión, propagar al evento de Calendar. Si cancela, eliminar el evento.

### 11.4. Sincronización con Google Meet o Microsoft Teams

**Descripción**. Para reuniones online, generar automáticamente una sala de videollamada y guardar la URL en la reunión.

**Cambios necesarios**:
- Migración: añadir `meet_url`, `meet_provider` (google_meet | teams), `meet_meeting_id` a `reuniones`.
- Form de reunión: nuevo campo "Reunión online" (checkbox) + selector de provider (si el usuario tiene varias integraciones).
- Service `VideoMeetingService` con strategies:
  - `GoogleMeetStrategy`: crea Calendar event con `conferenceData` para auto-generar Meet link.
  - `TeamsStrategy`: usa Microsoft Graph API `/me/onlineMeetings`.
- OAuth para Microsoft análogo a Google.
- Mostrar el link en `Reuniones/Show` con botón "Unirse a la reunión".
- Notificación a asistentes 10 min antes del inicio (job programado).

### 11.5. Sistema de cuentas premium

**Descripción**. Pasarela de pago (Stripe) para suscripción mensual/anual. Backend con `laravel/cashier`.

**Cambios necesarios**:
- Composer: `laravel/cashier-stripe`.
- Migración: `subscriptions`, `subscription_items` (las que cashier provee).
- Trait `Billable` en User.
- Webhooks Stripe en `/stripe/webhook` para gestión de pagos/cancelaciones.
- Job que sincroniza `user.rol_id` con el estado de suscripción:
  - Activa → `rol = premium`.
  - Cancelada/morosa → degrada a `user`.
- Frontend: página `/planes`, modal de checkout con Stripe Elements. Vista `/me/suscripcion` con estado y botón "Cancelar".
- Email transaccional al activar / cancelar (`MAIL_*` config).

### 11.6. Creación de reuniones premium

**Descripción**. Algunas funcionalidades reservadas a usuarios premium:

| Funcionalidad | Restricción premium |
|---|---|
| Reunión con > 5 destinatarios | ✓ |
| Reunión con > 5 opciones de fecha | ✓ |
| Reunión con videollamada integrada (Google Meet/Teams) | ✓ |
| Reunión con recordatorios automáticos por email | ✓ |
| Plantillas de reuniones (configuración guardable y reutilizable) | ✓ |
| Estadísticas de asistencia / dashboard | ✓ |
| Branding personalizado en enlaces públicos | ✓ |

**Cambios necesarios**:
- `ReunionPolicy::create`: si payload supera límites, exigir `$user->isPremium()`.
- `StoreReunionRequest::rules()`: validaciones condicionales según rol.
- Frontend: badges "PRO" en campos restringidos, modal de upgrade si el user normal intenta usarlos.
- Tabla `plantillas_reunion` (premium only).
- Job programado `EnviarRecordatorios` con scheduler de Laravel + Mail facade.

### 11.7. Mejoras menores acumuladas (backlog)

| Tema | Descripción |
|---|---|
| Tests | Cobertura PHPUnit en Services + Policies; tests E2E con Cypress/Playwright. |
| Push notifications | Web Push API para invitaciones y recordatorios sin email. |
| i18n | Soporte multi-idioma (es / en) con `react-i18next`. |
| Modo oscuro | Variables CSS ya preparadas; añadir toggle y persistencia. |
| Búsqueda global | Endpoint unificado `/api/search?q=` para reuniones + encuestas + usuarios. |
| Audit log | Tabla `actividades` con historial de cambios sensibles por usuario. |
| Rate limiting | Throttling por IP/user en endpoints de votación y creación. |
| Caché de resultados | `resultados` y `mis-votos` cacheados con invalidación tras voto. |
| Export | Exportar resultados de encuesta a CSV/PDF. |
| Drag & drop | Reordenar opciones de fecha en EncuestaForm. |
| Avatar de usuario | Subida y servicio de avatares (S3 o local + Intervention). |
