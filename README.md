# Authentication BE Microservice

Microservicio de autenticación para **Physionse**, construido con [NestJS](https://nestjs.com). Centraliza el registro e inicio de sesión de usuarios mediante federación con terceros (Google, Facebook, Azure AD) y provee JWT para el resto de los microservicios.

## Patrón de desarrollo de software

### Arquitectura general: Arquitectura Modular en capas

NestJS organiza el código por **módulos** (`AppModule → AuthModule, UserModule, RoleModule, AuthTypeModule`). Dentro de cada módulo se aplica el principio de **separación de responsabilidades en capas**:

```
Request → Controller (HTTP) → Service (lógica de negocio) → Repository/Entity (datos) → PostgreSQL
```

- **Controllers**: manejan el contrato HTTP (`@Post`, `@Body`, decoradores Swagger).
- **Services**: contienen la lógica de negocio y orquestan repositorios.
- **Entities**: modelos mapeados a tablas con TypeORM.
- **DTOs**: validación de entrada con `class-validator`.

### Patrones específicos por dominio

**1. Factory Method (fábrica) + Strategy — validación con terceros**

La validación de tokens de Google/Facebook/Azure se resuelve con un patrón de fábrica que combina `Factory Method` y `Strategy`:

- `IFederation` define la estrategia (`tokenValidate(token)`).
- `GoogleFederation`, `FacebookFederation`, `AzureFederation` son las **estrategias concretas**.
- `CreatorFactory` (clase abstracta) declara el método de factoría `factoryFederation()` y la plantilla `checkToken()`.
- `CreateGoogleFederation`, `CreateAzureFederation`, `CreateFacebookFederation` son las **fábricas concretas**.
- `federationObjects` (`FedarationObjects.ts`) es el registro (mapa) que asocia el `loginprovider` del request con su fábrica.

```
AuthController ──► AuthService.createUserWithRole(token, loginprovider, alias)
                                    │
                                    └──► CreatorFactory.checkToken() ◄── FederationObjects[loginprovider]
                                              │
                                              └──► factoryFederation() ──► IFederation.tokenValidate()
```

Ventaja: agregar un nuevo proveedor (ej. Apple) solo requiere crear `XxxFederation` + `CreateXxxFederation` y registrarlo en `federationObjects`, sin tocar el servicio.

**2. Repository Pattern — acceso a datos**

Los servicios inyectan `Repository<T>` de TypeORM (`@InjectRepository`), aislando las consultas SQL de la lógica de negocio.

**3. Dependency Injection / Inversión de Control**

Toda dependencia se inyecta por constructor (pattern nativo de NestJS), facilitando test con Mocks (ver `*.spec.ts`).

**4. Observer (Subscribers de TypeORM)**

`UserSubscriber` escucha eventos de entidades (`BeforeInsert`, `BeforeUpdate`) para lógica transversal (hooks de auditoría/registro).

**5. Middleware global transversal**

`AllExceptionsFilter` implementa un filtro global de excepciones (`app.useGlobalFilters`) que normaliza los errores HTTP.

## Requisitos previos

- Node.js 18+
- PostgreSQL instalado y una base de datos creada para el proyecto

## Configuración de entorno (.env)

El archivo `.env` está en `.gitignore` y **no se versiona**. Debe contener las siguientes variables (valores reales solo en tu máquina local):

```env
PORT=
DATABASE_URL=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
JWKS_URI=
AZURE_CLIENT_ID=
URL_FACEBOOK_TOKEN_VALIDATION=
```

## Instalación y ejecución

```bash
$ npm install
$ npm run start       # desarrollo
$ npm run start:dev   # watch mode
$ npm run start:prod  # producción (compila a dist)
```

> **Importante**: en desarrollo el esquema se sincroniza automáticamente desde las entidades. No usar en producción sin migraciones.

> Los datos sensibles (p. ej. contraseñas) se excluyen de las respuestas por defecto.

## Flujo de autenticación

1. El cliente (app RN) obtiene un **ID token** del proveedor elegido (Google Sign-In, Facebook Login o Microsoft Entra ID).
2. Envía el token al backend con `loginprovider` y `alias_role`.
3. El backend valida el token contra el proveedor vía el patrón Factory/Strategy.
4. Si el usuario no existe, lo crea con el rol indicado, guarda el **método de autenticación** usado y responde un JWT.
5. En `login`, si el email ya existe responde el JWT directamente; si no, `404`.

## Métodos de autenticación

Al crear un usuario se registra el método de autenticación utilizado (contraseña, Google, Facebook o Azure). El mapeo entre el proveedor de login y el tipo de autenticación está centralizado en `AuthService.PROVIDER_AUTH_TYPE`. Los usuarios creados por el endpoint de administración (`POST /users`) usan contraseña por defecto.

## Estructura del proyecto

```
src/
├── app.module.ts                 # Módulo raíz (Config, TypeORM, módulos)
├── main.ts                       # Bootstrap, prefijo /api/v1/, Swagger, CORS
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts        # /auth/register, /auth/login
│   ├── auth.service.ts
│   ├── dto/                      # register-user.dto, login.dto, return-user.dto
│   └── services/
│       ├── federation/           # IFederation + estrategias (Google/Azure/Facebook)
│       └── factory/              # CreatorFactory + fábricas concretas + FedarationObjects
├── user/                         # Módulo CRUD de usuarios
├── role/                         # Módulo de roles
├── auth-type/                    # Módulo de tipos de autenticación
└── common/
    ├── enum/error-messages.enum.ts
    ├── filters/all-exceptions.filter.ts
    └── subscriber/UserSubscriber.ts
```

## Pruebas

```bash
$ npm run test       # unit tests
$ npm run test:e2e   # e2e tests
$ npm run test:cov   # cobertura
```