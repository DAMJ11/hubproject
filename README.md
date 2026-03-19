# TidyHubb — Marketplace B2B de Manufactura Sostenible

Plataforma B2B que conecta **Marcas** (compradores) con **Fabricantes** (proveedores) para servicios de manufactura textil/confección, con ranking basado en sostenibilidad (Green Score).

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **UI** | React 18, Tailwind CSS 3, Shadcn/UI (Radix), Framer Motion |
| **Lenguaje** | TypeScript 5 (strict) |
| **Base de datos** | MySQL 8 (InnoDB, UTF8MB4) — consultas raw SQL via mysql2/promise |
| **Autenticación** | JWT + HTTP-only cookies, bcryptjs |
| **Realtime** | Pusher Channels (WebSockets) + polling fallback |
| **Linting** | ESLint 9, Biome 1.9 |
| **Deploy** | Netlify con @netlify/plugin-nextjs |
| **i18n** | ES / EN / FR (client-side, LanguageContext + localStorage) |

---

## Inicio Rápido

```bash
# 1. Clonar e instalar
git clone <url-del-repo> && cd manufy-clone
npm install

# 2. Crear .env.local con las variables requeridas (ver sección Variables de Entorno)
cp .env.example .env.local   # o crear manualmente

# 3. Importar esquema de base de datos
mysql -u root -p < database/schema.sql

# 4. Iniciar servidor de desarrollo
npm run dev          # http://localhost:3000  (usa Turbopack)

# 5. Registrarse en /register y acceder al dashboard en /dashboard
```

---

## Variables de Entorno

Crear un archivo `.env.local` con:

```env
# ── Base de datos (MySQL) ──────────────────────────
MYSQLHOST=localhost
MYSQLPORT=3307
MYSQLUSER=tu_usuario
MYSQLPASSWORD=tu_contraseña
MYSQLDATABASE=hubproject

# ── Autenticación ─────────────────────────────────
JWT_SECRET=clave-secreta-minimo-32-caracteres

# ── Pusher (Realtime Chat) ────────────────────────
NEXT_PUBLIC_PUSHER_KEY=tu_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=tu_cluster
PUSHER_KEY=tu_pusher_key
PUSHER_SECRET=tu_pusher_secret
PUSHER_APP_ID=tu_app_id

# ── Opcional ──────────────────────────────────────
RESEND_API_KEY=              # Emails transaccionales (Resend)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/                  # API Routes (30+ endpoints)
│   │   ├── auth/             # login, register, logout, me
│   │   ├── categories/       # categorías de servicio
│   │   ├── companies/        # empresas (búsqueda, listado)
│   │   ├── contracts/        # contratos + hitos
│   │   ├── conversations/    # mensajería (CRUD + mensajes)
│   │   ├── manufacturers/    # directorio + capacidades + certificaciones
│   │   ├── proposals/        # propuestas (enviar, aceptar, rechazar)
│   │   ├── realtime/         # auth de canales Pusher
│   │   └── rfq/              # solicitudes de cotización (CRUD + listado)
│   ├── dashboard/            # Páginas del panel (protegidas)
│   │   ├── contracts/        # gestión de contratos
│   │   ├── messages/         # chat en tiempo real
│   │   ├── opportunities/    # RFQs abiertas (fabricantes)
│   │   ├── projects/         # proyectos RFQ (marcas)
│   │   ├── proposals/        # propuestas enviadas/recibidas
│   │   ├── manufacturers/    # directorio de fabricantes
│   │   ├── payments/         # historial de pagos
│   │   ├── reviews/          # reseñas
│   │   ├── green-score/      # puntaje de sostenibilidad
│   │   ├── settings/         # configuración de perfil
│   │   └── ...
│   ├── login/                # página de inicio de sesión
│   ├── register/             # página de registro
│   └── (páginas públicas)/   # landing, blog, contacto, etc.
├── components/
│   ├── dashboard/            # componentes del panel (Sidebar, Header, MessagesPanel...)
│   └── ui/                   # componentes Shadcn/UI reutilizables
├── contexts/                 # DashboardUserContext, LanguageContext
├── hooks/                    # useOpportunitiesCount, useUnreadMessagesCount
├── lib/                      # auth, db, session, green-score, realtime/
├── types/                    # interfaces TypeScript (user, company, rfq, proposal, contract...)
└── styles/                   # CSS adicional (transiciones)
database/
└── schema.sql                # esquema completo MySQL (17 tablas)
prisma/
└── schema.prisma             # esquema Prisma (documentación, no se usa para queries)
docs/                         # documentación técnica
```

---

## Modelo de Datos (17 tablas)

```
companies ──┬── users ──── addresses
            ├── manufacturer_capabilities ── service_categories
            ├── manufacturer_certifications
            ├── rfq_projects ──┬── rfq_materials
            │                  ├── rfq_attachments
            │                  └── proposals
            ├── contracts ──── contract_milestones
            ├── conversations ── messages
            ├── reviews
            ├── payments
            └── notifications
```

**Roles:** `brand` (marca/comprador), `manufacturer` (fabricante/proveedor), `admin`

---

## API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Inicio de sesión → JWT en cookie |
| POST | `/api/auth/register` | Registro (crea empresa + usuario atómicamente) |
| POST | `/api/auth/logout` | Cierre de sesión |
| GET | `/api/auth/me` | Usuario actual autenticado |

### RFQ (Solicitudes de Cotización)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/rfq` | Listar RFQs (filtrado por rol) |
| POST | `/api/rfq` | Crear nueva solicitud |
| GET | `/api/rfq/[id]` | Detalle de RFQ |
| PUT | `/api/rfq/[id]` | Actualizar RFQ |
| GET | `/api/rfq/[id]/proposals` | Propuestas recibidas (con Green Score) |

### Propuestas
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/proposals` | Enviar propuesta a un RFQ |
| GET | `/api/proposals/mine` | Mis propuestas (fabricante) |
| GET | `/api/proposals/[id]` | Detalle de propuesta |
| PUT | `/api/proposals/[id]/respond` | Aceptar/rechazar propuesta (marca) |

### Contratos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/contracts` | Listar contratos |
| POST | `/api/contracts` | Crear contrato |
| GET | `/api/contracts/[id]` | Detalle + hitos |

### Mensajería
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/conversations` | Listar conversaciones |
| POST | `/api/conversations` | Iniciar conversación |
| GET | `/api/conversations/[id]` | Conversación + mensajes |
| POST | `/api/conversations/[id]/messages` | Enviar mensaje |

### Fabricantes y Empresas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/companies` | Listar empresas |
| GET | `/api/manufacturers` | Directorio de fabricantes (con ranking) |
| GET | `/api/manufacturers/:id` | Perfil + capacidades + certificaciones |

### Realtime
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/realtime/auth` | Autorización de canales Pusher |

---

## Green Score (Algoritmo de Sostenibilidad)

Puntaje compuesto (0–100) que rankea fabricantes por RFQ:

| Factor | Peso | Cálculo |
|--------|------|---------|
| **Proximidad** | 30% | Distancia Haversine: <50km=100, 50-200km=75, 200-500km=50, >500km=25 |
| **Materiales** | 35% | % reciclado × 1.5 (cap 100) |
| **Certificaciones** | 25% | GOTS=30, GRS=28, OEKO-TEX=25, BCI=20, Fair Trade=22, ISO=10 |
| **Historial** | 10% | Rating promedio × 20 |

---

## Funcionalidades Implementadas

- [x] Autenticación JWT con cookies HTTP-only y roles (brand/manufacturer/admin)
- [x] Registro atómico (empresa + usuario en transacción)
- [x] Ciclo completo RFQ: crear → publicar → recibir propuestas → adjudicar → contrato
- [x] Propuestas con ranking Green Score
- [x] Contratos con hitos (milestones) y seguimiento de estado
- [x] Mensajería en tiempo real (Pusher + polling fallback)
- [x] Directorio de fabricantes con filtros (categoría, ciudad, certificaciones)
- [x] Capacidades y certificaciones de fabricantes
- [x] Dashboard responsivo con sidebar colapsable y soporte mobile
- [x] Transiciones animadas (Framer Motion)
- [x] Multilenguaje (ES/EN/FR) con detección automática del navegador
- [x] Panel de administrador

---

## Funcionalidades Faltantes para Producción

### Críticas (bloquean pruebas de despliegue)

| # | Funcionalidad | Estado | Descripción |
|---|--------------|--------|-------------|
| 1 | **Módulo de Pagos** | ❌ Incompleto | UI usa nombres legacy (booking_code, client_name). Falta integración con pasarela de pago real (ej: Stripe, MercadoPago, Wompi) |
| 2 | **Módulo de Reseñas** | ❌ Incompleto | No alineado completamente con el modelo B2B de contratos |
| 3 | **Subida de archivos** | ❌ Falta | Los campos `file_url` existen en DB pero no hay handler de upload (para adjuntos RFQ, certificados, imágenes) |
| 4 | **Emails transaccionales** | ❌ Falta | Resend configurado pero no conectado a eventos (registro, nueva propuesta, contrato, pago) |
| 5 | **Validaciones de adjudicación** | ❌ Falta | Sin prevención de doble adjudicación, sin verificación de estado RFQ antes de aceptar propuesta |

### Importantes (mejoran confiabilidad)

| # | Funcionalidad | Descripción |
|---|--------------|-------------|
| 6 | **Recuperación de contraseña** | No existe flujo de "olvidé mi contraseña" |
| 7 | **Verificación de email** | Campo `email_verified` existe pero sin flujo de verificación |
| 8 | **Rate limiting en API** | Sin protección contra abuso en endpoints públicos (login, register) |
| 9 | **CSRF protection** | Solo depende de cookie HTTP-only; sin token CSRF adicional |
| 10 | **Paginación en APIs** | Varios endpoints retornan todos los registros sin límite |
| 11 | **Manejo de errores global** | Sin error boundary en React ni manejo centralizado de errores API |
| 12 | **Health check endpoint** | Falta `/api/health` para monitoreo de deploy |
| 13 | **Seed de datos** | Sin script para poblar la DB con datos de prueba |

### UX / Polish

| # | Funcionalidad | Descripción |
|---|--------------|-------------|
| 14 | **Toasts / feedback** | Sin notificaciones visuales al crear RFQ, enviar propuesta, etc. |
| 15 | **Estados vacíos** | Sin mensajes amigables cuando las listas están vacías |
| 16 | **Confirmación destructiva** | Sin diálogos de confirmación para cancelar RFQ, rechazar propuesta, etc. |
| 17 | **Breadcrumbs** | Sin navegación de ruta en dashboard |
| 18 | **Dark mode** | Soporte parcial (Tailwind configurado, pero no implementado) |
| 19 | **Accesibilidad (a11y)** | ESLint tiene reglas de a11y deshabilitadas |

---

## Recomendaciones de Mejora

### Arquitectura

1. **Agregar un ORM activo** — El esquema Prisma existe pero no se usa para queries. Considerar usarlo para validación de tipos en runtime y migraciones, o eliminarlo para evitar confusión.
2. **Middleware de autenticación** — Centralizar la verificación de sesión en un middleware de Next.js en vez de llamar `getSessionUser()` en cada endpoint.
3. **Validación de entrada** — Agregar Zod para validar payloads en cada endpoint API (actualmente se confía en el cliente).
4. **Separar lógica de negocio** — Mover lógica de los route handlers a servicios (`src/services/`) para mejor testabilidad.

### Seguridad

5. **Rate limiting** — Implementar con `next-rate-limit` o similar en endpoints sensibles.
6. **CORS estricto** — Configurar headers CORS explícitos para producción.
7. **Sanitización de HTML** — Si se permite rich text en mensajes o descripciones, sanitizar output para prevenir XSS.
8. **Auditoría de dependencias** — Ejecutar `npm audit` regularmente.

### Base de Datos

9. **Migraciones** — Implementar sistema de migraciones (Prisma migrate o raw SQL versionado).
10. **Índices** — Revisar queries lentas y agregar índices compuestos donde se necesiten.
11. **Soft deletes** — Las eliminaciones actualmente son hard delete; considerar `deleted_at` timestamps.

### DevOps

12. **CI/CD pipeline** — Agregar GitHub Actions para lint, build y tests automáticos en PRs.
13. **Tests** — No hay tests unitarios ni de integración. Implementar al menos tests para API auth y flujo RFQ.
14. **Monitoreo** — Agregar logging estructurado y monitoreo de errores (Sentry).
15. **Backups de DB** — Configurar backups automáticos de MySQL en producción.

### UX

16. **Carga optimista** — Implementar optimistic updates para operaciones frecuentes.
17. **Skeleton loaders** — Reemplazar spinners con skeletons para mejor percepción de velocidad.
18. **SEO** — Agregar metadata dinámica, Open Graph tags, sitemap.xml.

---

## Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo (Turbopack, accesible en red)
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # ESLint + TypeScript checks
```

---

## Deploy en Netlify

El proyecto está configurado para Netlify:

```toml
# netlify.toml
[build]
  command = "bun run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Variables de entorno requeridas en Netlify Dashboard:**
- Todas las de la sección "Variables de Entorno"
- `NODE_ENV=production`

---

## Licencia

Proyecto privado — Todos los derechos reservados.
