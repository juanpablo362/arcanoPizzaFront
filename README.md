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

Las peticiones a `/api` se redirigen a la API ArcanoPizza. Por defecto usa `localhost:52413`. Si la API corre en otro puerto (44338, 7030, 5010), edita `proxy.conf.json` y cambia el `target`.

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
