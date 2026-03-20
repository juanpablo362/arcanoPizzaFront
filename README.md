# ArcanoPizzaFront

Frontend Angular para el sistema de pedidos ArcanoPizza. Consume la API REST (.NET 10 + PostgreSQL) para gestionar extras, productos, pedidos, pagos y usuarios.

Generado con [Angular CLI](https://github.com/angular/angular-cli) 21.2.2.

## Servidor de desarrollo

Para iniciar el servidor local:

```bash
ng serve
```

Abre el navegador en `http://localhost:4200/`. La aplicación se recarga al modificar los archivos.

### Proxy de la API

El front usa rutas **relativas** (`/api/...`). Con **SSR**, `ng serve` atiende el tráfico con **Express** ([`server.ts`](src/server.ts)): las peticiones a `/api` se **proxifican allí** al backend (`http://localhost:5010` por defecto). El `proxy.conf.json` sigue siendo útil para escenarios sin SSR; en SSR el origen del proxy en Node es `server.ts`.

Variable de entorno opcional al ejecutar el servidor Node (`ng serve` o `serve:ssr`):

- **`API_PROXY_TARGET`**: URL base de la API (ej. `https://localhost:7030` si solo tienes HTTPS). Si no se define, se usa `http://localhost:5010`.

El navegador solo habla con `http://localhost:4200`, así **no se dispara CORS** por el origen de la API.

| Archivo | Uso |
|--------|-----|
| [`proxy.conf.json`](proxy.conf.json) | Por defecto → `http://localhost:5010` (`followRedirects: true`: si la API redirige a HTTPS, el proxy lo resuelve y el navegador no ve CORS) |
| [`proxy.conf.https.json`](proxy.conf.https.json) | API en HTTPS → `https://localhost:7030` (`secure: false` + `followRedirects: true`) |

Solo HTTP:

```bash
ng serve
```

API en **HTTPS:7030** (certificado autofirmado):

```bash
ng serve --proxy-config proxy.conf.https.json
```

#### Redirección a `https://localhost:7030` y CORS

Si el error menciona **`(redirected from 'http://localhost:4200/api/...')`** hacia `https://localhost:7030`, la API está respondiendo **302/307** (p. ej. `UseHttpsRedirection`). Sin `followRedirects`, el proxy reenvía ese redirect y el **XHR** lo sigue en el cliente → otro origen → CORS. Con **`followRedirects: true`** el proxy completa la cadena y el navegador solo ve la respuesta en `http://localhost:4200/api/...`.

#### OPTIONS 405 sin pasar por el proxy

Si ves **`OPTIONS`** a `7030` **sin** `4200` en la URL de la petición, la app está usando **URL absoluta** al backend; usa solo **`/api`** + proxy o habilita CORS en la API (`AddCors` / `UseCors`, origen `http://localhost:4200`).

**Auth (JWT + refresh)** — cabecera en POST/PUT con body: `Content-Type: application/json`. El front usa:

| Método | Ruta | Body (JSON) |
|--------|------|---------------|
| POST | `/api/auth/register` | `{ "nombreUsuario", "correo", "password", "telefono" }` (`telefono` puede ser `null`) |
| POST | `/api/auth/login` | `{ "correo", "password" }` |
| POST | `/api/auth/refresh` | `{ "refreshToken" }` (sin interceptores; lo gestiona `AuthService`) |
| POST | `/api/auth/logout` | `{ "refreshToken" }` |

Respuesta de **login** y **refresh** (resumen):

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 1800,
  "usuario": {
    "idUsuario": 1,
    "nombreUsuario": "...",
    "correo": "...",
    "rol": "Cliente"
  }
}
```

Rutas con `[Authorize]`: cabecera `Authorization: Bearer <accessToken>`. El front guarda access y refresh (p. ej. en `localStorage`); ante **401** en peticiones protegidas, el interceptor intenta `/api/auth/refresh` y reintenta la petición. Si el registro no devuelve esta forma de respuesta, se muestra éxito y se invita a iniciar sesión.

## Arquitectura del proyecto

El proyecto sigue una estructura por carpetas basada en responsabilidades: **core**, **shared**, **features** y **layouts**.

```
src/app/
├── core/                    # Servicios y utilidades globales (singleton)
├── shared/                  # Componentes, pipes y directivas reutilizables
├── features/                # Módulos por pantalla o funcionalidad
├── layouts/                 # Estructura visual (header, sidebar, footer)
└── app.routes.ts            # Rutas principales
```

### core/

Código que se carga una sola vez en toda la aplicación.

| Carpeta / archivo | Propósito |
|------------------|-----------|
| **guards/** | Protegen rutas. `auth-guard.ts` redirige a login si el usuario no está autenticado. |
| **interceptors/** | Modifican las peticiones HTTP. `auth-interceptor.ts` añade el token Bearer a cada request. `error-interceptor.ts` centraliza el manejo de errores (logs, redirecciones, etc.). |
| **services/** | Servicios globales. `api.ts` provee HttpClient y baseUrl para las llamadas a la API. `auth.ts` gestiona login, logout y estado de autenticación con signals. |

### shared/

Elementos reutilizables en varias pantallas.

| Carpeta / archivo | Propósito |
|-------------------|-----------|
| **components/** | `button`, `input`, `loading-spinner` para usar en toda la app. |
| **pipes/** | Transforman datos en plantillas. Ejemplo: `safe-html-pipe` para HTML seguro. |
| **directives/** | Directivas reutilizables. Ejemplo: `autofocus` para enfocar el primer campo. |

### features/

Módulos por pantalla o flujo de negocio. Cada feature suele tener su componente, servicio y rutas.

| Feature | Propósito |
|---------|-----------|
| **extras/** | Extras para pizzas. `extras.service.ts` llama a `/api/Extras`. |
| **pedidos/** | Gestión de pedidos. `pedidos.service.ts` llama a `/api/Pedidos`. Protegido por `authGuard`. |
| **auth/** | Login y autenticación. Ruta pública para que el usuario inicie sesión. |

### layouts/

Estructura visual común de la app.

| Componente | Propósito |
|------------|-----------|
| **main-layout** | Define header, sidebar, contenido principal y footer. Se usa como contenedor de las rutas protegidas. |
| **header** | Barra superior con enlaces de navegación. |
| **sidebar** | Menú lateral de navegación. |
| **footer** | Pie de página con información de copyright. |

### Rutas y lazy loading

Las features se cargan bajo demanda (lazy loading):

- `/extras` → Feature Extras (público)
- `/pedidos` → Feature Pedidos (protegido por `authGuard`)
- `/auth` → Feature Auth (público)

Esto reduce el tamaño del bundle inicial y mejora el tiempo de carga.

## Generación de código

Para crear componentes, servicios, etc.:

```bash
ng generate component nombre-componente
ng generate service nombre-servicio
ng generate guard nombre-guard
```

Lista de schematics disponibles:

```bash
ng generate --help
```

## Compilación

Para compilar el proyecto:

```bash
ng build
```

Los artefactos se generan en `dist/`. La compilación de producción optimiza el código automáticamente.

## Tests

Para ejecutar los tests unitarios con [Vitest](https://vitest.dev/):

```bash
ng test
```

Para tests e2e (requiere configuración previa):

```bash
ng e2e
```

## Enlaces útiles

- [Documentación de Angular](https://angular.dev)
- [Referencia del CLI](https://angular.dev/tools/cli)
- [Guía de HttpClient](https://angular.dev/guide/http)
