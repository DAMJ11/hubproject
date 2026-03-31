# AUDITORÍA PRE-DESPLIEGUE — FashionHubb
## Fecha objetivo: 1 de abril de 2026
## Fecha de auditoría: 30 de marzo de 2026

> **Contexto:** Plataforma B2B marketplace de moda que conecta marcas con fabricantes.  
> **Stack:** Next.js 15.5, MySQL 8, JWT custom, Pusher, Prisma (parcial), Railway.  
> **Entorno destino:** Railway (MySQL + Next.js).

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Estado Actual del Proyecto](#2-estado-actual-del-proyecto)
3. [Funcionalidades Faltantes para Experiencia Profesional](#3-funcionalidades-faltantes-para-experiencia-profesional)
4. [Auditoría de Seguridad](#4-auditoría-de-seguridad)
5. [Checklist de Despliegue](#5-checklist-de-despliegue)
6. [Criterios de un Buen Despliegue B2B](#6-criterios-de-un-buen-despliegue-b2b)
7. [Plan de Acción Priorizado (48h)](#7-plan-de-acción-priorizado-48h)
8. [Riesgos y Mitigaciones](#8-riesgos-y-mitigaciones)
9. [Veredicto Final](#9-veredicto-final)

---

## 1. RESUMEN EJECUTIVO

### Lo que SÍ está listo
- Autenticación JWT funcional con cookies HTTP-only
- Flujo completo RFQ → Propuestas → Contratos → Milestones
- Mensajería en tiempo real (Pusher + polling fallback)
- Dashboard multi-rol (brand / manufacturer / admin)
- Internacionalización (ES/EN/FR)
- Rate limiting en login y registro
- Validación de entrada con Zod en endpoints críticos
- Health check endpoint
- Paginación segura con bounds checking
- Schema de BD normalizado con 21 tablas

### Lo que NO está listo (bloqueante)
- ~~**Sin pasarela de pagos real** — los pagos son simulados~~ ✅ Stripe integrado (2026-03-30)
- **Sin subida de archivos** — campos `file_url` en BD vacíos, sin handler
- ~~**Sin emails transaccionales**~~ ✅ Resend integrado (2026-03-31) — verificación registro + password reset
- ~~**Sin recuperación de contraseña**~~ ✅ Implementado (2026-03-31) — forgot + reset con token 1h
- ~~**Sin verificación de email**~~ ✅ Implementado (2026-03-31) — token 24h al registrar
- **Sin tests automatizados** — cero tests unitarios o de integración
- **Sin CI/CD pipeline** — no hay GitHub Actions
- ~~**Sin security headers**~~ ✅ Configurados (2026-03-31) — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- ~~**Sin .env.example**~~ ✅ Creado (2026-03-31)

---

## 2. ESTADO ACTUAL DEL PROYECTO

### Arquitectura de datos

| Modelo | Estado funcional | Notas |
|--------|-----------------|-------|
| Users | ✅ Completo | Auth, roles, CRUD admin |
| Companies | ✅ Completo | Brand + manufacturer con búsqueda |
| ServiceCategory | ✅ Completo | Catálogo de servicios |
| RfqProject | ✅ Completo | Crear, listar, filtrar por rol |
| RfqMaterial | ✅ Completo | Materiales asociados a RFQs |
| RfqAttachment | ⚠️ Schema solo | Sin handler de upload |
| Proposal | ✅ Completo | Submit, respond, mine |
| Contract | ✅ Completo | CRUD con milestones |
| ContractMilestone | ✅ Completo | Estados y seguimiento |
| Conversation | ✅ Completo | Iniciar, responder, real-time |
| Message | ✅ Completo | Texto, read status, Pusher |
| Review | ⚠️ Parcial | CRUD básico, no alineado a UX B2B |
| Payment | ✅ Stripe | Checkout, Portal, Webhooks |
| UserPaymentMethod | ✅ Stripe | Sincronizado vía webhook |
| Notification | ⚠️ Schema solo | Sin sistema de envío |
| Subscription | ✅ Stripe | Checkout + Webhook sync |
| SubscriptionPlan | ✅ Stripe | 6 planes con Price IDs |
| SubscriptionInvoice | ✅ Stripe | Sincronizadas vía webhook |
| Address | ✅ Completo | CRUD funcional |
| ManufacturerCapability | ✅ Completo | Filtrado inteligente en RFQs |
| ManufacturerCertification | ✅ Completo | GOTS, GRS, ISO, etc. |

### Endpoints API — 36 rutas

| Grupo | Endpoints | Estado |
|-------|-----------|--------|
| Auth | login, register, logout, me | ✅ Funcional |
| RFQ | GET/POST/PUT rfq, rfq/[id], rfq/[id]/proposals | ✅ Funcional |
| Proposals | mine, [id]/respond | ✅ Funcional |
| Contracts | GET contracts, contracts/[id] | ✅ Funcional |
| Conversations | GET/POST, [id]/messages, [id]/respond, rfq-options | ✅ Funcional |
| Companies | GET, search, me | ✅ Funcional |
| Manufacturers | GET, capabilities, certifications | ✅ Funcional |
| Dashboard | stats, users, payments, reports, reviews, messages, categories, addresses | ✅ Funcional |
| Subscriptions | GET/POST, cancel | ✅ Stripe integrado |
| Payment Methods | GET/POST, [id] | ✅ Stripe Portal |
| Realtime | auth (Pusher) | ✅ Funcional |
| Health | GET /api/health | ✅ Funcional |

---

## 3. FUNCIONALIDADES FALTANTES PARA EXPERIENCIA PROFESIONAL

### 3.1 CRÍTICAS — Sin estas, la plataforma no es creíble para usuarios B2B

#### ~~P0: Pagos reales~~ ✅ COMPLETADO (2026-03-30)
**Estado:** Stripe integrado con Checkout, Customer Portal, Webhooks, tab Suscripción en Settings.  
**Detalle:** Ver `docs/integracion-stripe.md`

#### P0: Subida de archivos
**Estado:** Las tablas `rfq_attachments` existen con campos `file_url`, `file_name`, `file_size` pero NO hay handler de upload.  
**Impacto:** Sin archivos no se pueden adjuntar fichas técnicas a RFQs, certificaciones a fabricantes, evidencia en milestones, ni imágenes de perfil de empresa.  
**Solución mínima:**
- Cloudinary / AWS S3 / Vercel Blob para storage
- Endpoint `/api/upload` con validación de tipo MIME, tamaño máximo (10MB), antivirus
- Actualizar formularios de RFQ, company profile, milestones

#### P0: Emails transaccionales
**Estado:** No hay servicio de email integrado. Las labels de i18n mencionan "forgot password" pero no hay backend.  
**Impacto:** Los usuarios no reciben confirmación de registro, notificación de nuevas propuestas, cambios de estado de contrato, ni pueden recuperar contraseña.  
**Solución mínima:**
- Integrar Resend (ya mencionado en docs pero no implementado)
- Emails mínimos: confirmación registro, nueva propuesta recibida, contrato creado, pago recibido, reset password
- Template HTML responsive

#### P0: Recuperación de contraseña
**Estado:** UI tiene el botón "¿Olvidaste tu contraseña?" pero no hace nada.  
**Impacto:** Usuarios bloqueados permanentemente si olvidan la contraseña. Inaceptable para cualquier plataforma de producción.  
**Solución mínima:**
- Endpoint POST `/api/auth/forgot-password` → genera token temporal (1h), envía email
- Endpoint POST `/api/auth/reset-password` → valida token, actualiza contraseña
- Tabla `password_reset_tokens` o campo temporal en `users`

### 3.2 IMPORTANTES — Necesarias para confianza profesional

#### P1: Verificación de email
**Estado:** Campo `email_verified` existe en BD (BOOLEAN), pero sin flujo.  
**Impacto:** Sin verificación, cualquiera puede registrarse con email falso. Riesgo de spam y suplantación.  
**Solución:** Token por email al registrarse → endpoint `/api/auth/verify-email?token=xxx`

#### P1: Notificaciones in-app
**Estado:** Tabla `notifications` existe pero no hay sistema de creación ni lectura.  
**Impacto:** Sin notificaciones, los usuarios no saben que tienen nuevas propuestas, mensajes o cambios en contratos sin entrar al dashboard.  
**Solución:** Service de notificaciones que inserta en tabla + Pusher push + badge en navbar

#### P1: Onboarding guiado
**Estado:** Existe carpeta `src/app/[locale]/dashboard/onboarding/` pero sin verificar completitud.  
**Impacto:** Usuarios nuevos no saben por dónde empezar. Un fabricante necesita configurar capabilities y certificaciones antes de recibir RFQs.

#### P1: Perfil de empresa completo
**Estado:** Funcionalidad básica existe, pero faltan campos críticos B2B:
- Logo upload (requiere file upload)
- Portafolio / galería de trabajos
- Capacidad de producción mensual visible
- Tiempos de respuesta promedio
- Testimonios / casos de éxito

#### P1: Validación de adjudicación de RFQ
**Estado:** Sin prevención de doble adjudicación. Se puede aceptar múltiples propuestas para el mismo RFQ.  
**Impacto:** Conflictos contractuales graves. Un brand podría comprometerse con 2 fabricantes para el mismo proyecto.  
**Solución:** Al aceptar propuesta → marcar RFQ como `awarded`, rechazar automáticamente las demás

#### P1: Términos y condiciones
**Estado:** Campo `terms_accepted` existe en registro pero no hay página de T&C.  
**Impacto:** Legalmente indefendible si hay una disputa.  
**Solución:** Página `/terms`, `/privacy-policy` con contenido real

### 3.3 DESEABLES — Diferencian de competidores

| # | Funcionalidad | Impacto | Complejidad |
|---|--------------|---------|-------------|
| 1 | Dashboard analytics avanzado | Gráficos de tendencias, comparativas, KPIs | Media |
| 2 | Exportar a PDF (contratos, facturas) | Profesionalismo, archivo legal | Media |
| 3 | Sistema de disputas | Resolución de conflictos contractuales | Alta |
| 4 | Comparador de propuestas | Side-by-side para brands evaluando fabricantes | Media |
| 5 | Calendar/timeline de milestones | Visualización de progreso de producción | Media |
| 6 | Webhooks para integraciones | ERPs, contabilidad, inventario | Baja |
| 7 | API pública documentada | Integraciones de terceros | Media |
| 8 | PWA / Mobile app | Acceso rápido mobile para fabricantes en planta | Media |
| 9 | Multi-moneda dinámica | EUR, USD, COP con tasas en tiempo real | Baja |
| 10 | Geolocalización de fabricantes | Mapa interactivo con filtros | Media |

---

## 4. AUDITORÍA DE SEGURIDAD

### 4.1 Clasificación por severidad

#### CRÍTICO (debe resolverse antes de producción)

| # | Vulnerabilidad | Detalle | OWASP Ref |
|---|---------------|---------|-----------|
| ~~S1~~ | ~~**JWT_SECRET hardcodeado**~~ ✅ CORREGIDO (2026-03-31) — Lanza error en producción si no está configurado | ~~A02: Cryptographic Failures~~ |
| S2 | **Credenciales en .env** | El archivo `.env` está en el repositorio con contraseña real de MySQL (`Duber1037776117*`) y claves Pusher. Si el repo es público o se filtra, toda la infraestructura queda comprometida. | A02: Cryptographic Failures |
| S3 | **Sin validación CSRF** | Las APIs mutan estado con POST/PUT/DELETE usando solo cookies. Un sitio malicioso podría ejecutar acciones en nombre del usuario logueado enviando requests cross-origin. SameSite=lax mitiga parcialmente pero no protege GET requests que mutan estado. | A01: Broken Access Control |
| ~~S4~~ | ~~**Sin security headers**~~ ✅ CORREGIDO (2026-03-31) — Headers configurados en next.config.js | ~~A05: Security Misconfiguration~~ |
| S5 | **Rate limiting solo en memoria** | Si Railway escala a múltiples instancias, el rate limiter no comparte estado. Un atacante puede rotar entre instancias para bypass. | A07: Identification & Authentication Failures |
| S6 | **Eliminación hard-delete de usuarios** | El endpoint DELETE `/api/dashboard/users` borrar registros permanentemente. Sin soft-delete no hay auditoría ni recuperación. | A09: Security Logging & Monitoring Failures |

#### ALTO (debería resolverse para producción)

| # | Vulnerabilidad | Detalle | OWASP Ref |
|---|---------------|---------|-----------|
| S7 | **Sin auditoría de acciones** | No hay logging de quién hizo qué. Si un admin borra un usuario o cambia una contraseña, no queda registro. | A09: Logging & Monitoring |
| S8 | **SQL directo con mysql2** | Aunque se usan parámetros preparados (seguro contra SQLi), la coexistencia de Prisma + mysql2 directo crea riesgo de que un desarrollador futuro concatene strings SQL. | A03: Injection |
| S9 | **Token JWT de 7 días sin rotación** | Un token robado da acceso completo durante 7 días. No hay refresh token, no hay blacklist, no hay rotación. | A07: Authentication Failures |
| ~~S10~~ | ~~**Sin verificación de email**~~ ✅ CORREGIDO (2026-03-31) — Email verification con Resend | ~~A07: Identification Failures~~ |
| S11 | **Contraseña mínima 8 chars, sin requisitos de complejidad** | El schema valida `min(8)` pero no exige mayúsculas, números o caracteres especiales. | A07: Authentication Failures |
| S12 | **Accesibilidad deshabilitada en linter** | 12+ reglas de a11y están en `"off"` en biome.json. Esto oculta problemas de accesibilidad. | Compliance risk |

#### MEDIO (mejorar progresivamente)

| # | Vulnerabilidad | Detalle |
|---|---------------|---------|
| S13 | **Sin protección contra enumeración de usuarios** | Login devuelve "Invalid email or password" (correcto), pero registro devuelve "An account with this email already exists" — esto confirma existencia de cuentas |
| S14 | **SEARCH endpoint sin rate limit** | `/api/companies/search` permite búsquedas ilimitadas. Un scraper podría extraer todo el directorio de fabricantes |
| S15 | **Dependencias duplicadas** | `bcrypt` Y `bcryptjs` están en dependencies. bcrypt nativo puede causar problemas de build en Railway. Usar solo bcryptjs |
| S16 | **Error messages verbosos** | `console.error` expone stack traces en server logs sin sanitizar PII |
| S17 | **Sin Content-Security-Policy** | Permite inyección de scripts de terceros, ejecutar inline JS arbitrario |

### 4.2 Configuración de seguridad recomendada

```typescript
// next.config.js — Headers de seguridad mínimos
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requiere unsafe-eval en dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://images.unsplash.com https://flagcdn.com",
      "font-src 'self'",
      "connect-src 'self' wss://*.pusher.com https://*.pusher.com",
      "frame-ancestors 'none'",
    ].join('; ')
  },
];
```

---

## 5. CHECKLIST DE DESPLIEGUE

### 5.1 Infraestructura (Railway)

| # | Item | Estado | Acción requerida |
|---|------|--------|-----------------|
| 1 | MySQL provisionado en Railway | ❓ Verificar | Crear servicio MySQL en Railway |
| 2 | Schema de BD ejecutado | ❓ Verificar | Ejecutar `schema-railway.sql` vía Railway CLI o GUI |
| 3 | Variables de entorno configuradas | ❌ Parcial | Configurar TODAS las 21 variables en Railway (ver guía) |
| 4 | `JWT_SECRET` aleatorio (32+ chars) | ❌ URGENTE | Generar: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| 5 | `NODE_ENV=production` | ❌ Verificar | Configurar en Railway |
| 6 | Dominio custom configurado | ❓ Verificar | Railway genera URL automática, configurar dominio si existe |
| 7 | SSL/HTTPS activo | ✅ Railway auto | Railway provee HTTPS por defecto |
| 8 | Build exitoso | ❓ Verificar | Ejecutar `npm run build` localmente primero |
| 9 | Health check configurado | ✅ Existe | `/api/health` — configurar en Railway como health check |
| 10 | Logs accesibles | ✅ Railway auto | Railway muestra logs del servicio |

### 5.2 Código y configuración

| # | Item | Estado | Prioridad |
|---|------|--------|-----------|
| 11 | `.env` removido de Git / .gitignore | ✅ Ya configurado | `.env*` en .gitignore |
| 12 | `.env.example` creado | ✅ Completado | Template sin valores reales |
| 13 | Security headers en next.config.js | ✅ Completado | HSTS, X-Frame-Options, etc. |
| 14 | JWT_SECRET sin fallback inseguro | ✅ Completado | Lanza error en producción |
| 15 | Eliminar bcrypt nativo (dejar solo bcryptjs) | ✅ Completado | Solo bcryptjs |
| 16 | robots.txt | ✅ Completado | Bloquea /dashboard, /api |
| 17 | sitemap.xml | ❌ Falta | SEO para páginas públicas |
| 18 | Favicon y Open Graph meta | ⚠️ Parcial | Metadata existe pero verificar imágenes OG |
| 19 | Error page (500, 404) | ✅ Existe | `error.tsx` y `not-found.tsx` presentes |
| 20 | Prisma generate en build | ✅ Configurado | Script: `"build": "prisma generate && next build"` |

### 5.3 Base de datos

| # | Item | Estado | Notas |
|---|------|--------|-------|
| 21 | Schema ejecutado sin errores | ❓ Verificar | Usar `schema-railway.sql` (sin DROP) |
| 22 | Datos seed (admins) | ✅ Existe | `seed-admins.sql` disponible |
| 23 | Datos seed (demo) | ✅ Existe | `seed.sql` con datos de prueba |
| 24 | Índices en columnas de JOIN/WHERE | ⚠️ Revisar | Verificar índices en `rfq_projects.brand_company_id`, `proposals.rfq_id`, etc. |
| 25 | Connection pooling configurado | ✅ Configurado | 10 conexiones en pool |
| 26 | Backup strategy definida | ❌ Falta | Railway ofrece backups manuales; configurar cron |
| 27 | Plan de migración definido | ❌ Falta | Sin Prisma migrations activas; cambios = SQL manual |

### 5.4 Monitoreo post-deploy

| # | Item | Estado | Prioridad |
|---|------|--------|-----------|
| 28 | Health check automático | ⚠️ Configurar | Railway puede hacer health checks periódicos |
| 29 | Error tracking (Sentry) | ❌ Falta | Sin monitoreo de errores en producción |
| 30 | Uptime monitoring | ❌ Falta | Sin alertas si el servicio cae |
| 31 | Performance monitoring | ❌ Falta | Sin métricas de latencia |
| 32 | Log agregation | ❌ Falta | Solo console.error; sin búsqueda ni alertas |

---

## 6. CRITERIOS DE UN BUEN DESPLIEGUE B2B

### Estándares de la industria para marketplaces B2B

Basado en las mejores prácticas de plataformas como Alibaba, Faire, Manufy, Kombo:

#### Tabla de cumplimiento

| Criterio | Estándar industria | FashionHubb | Gap |
|----------|-------------------|-------------|-----|
| **Autenticación** | OAuth2/OIDC + MFA + email verification | JWT custom + bcrypt, sin MFA, sin email verification | ALTO |
| **Pagos** | Escrow/pasarela PCI-DSS compliant | Simulado, sin PCI | CRÍTICO |
| **Archivos** | CDN + virus scan + signed URLs | No implementado | CRÍTICO |
| **Email** | Transaccional + marketing separados | No implementado | CRÍTICO |
| **Seguridad** | OWASP Top 10 mitigado, pentest | 6 issues críticos encontrados | ALTO |
| **Tests** | >70% cobertura, CI/CD | 0% cobertura, sin CI | ALTO |
| **Monitoreo** | APM + error tracking + uptime | Solo console.error | ALTO |
| **Backups** | Automatizados, verificados, RPO <24h | Sin configurar | ALTO |
| **Legal** | T&C, Privacy Policy, GDPR compliance | Sin páginas legales | MEDIO |
| **SEO** | Sitemap, robots, structured data | Falta sitemap y robots | BAJO |
| **Accesibilidad** | WCAG 2.1 AA | Reglas a11y deshabilitadas | MEDIO |
| **Performance** | LCP <2.5s, FID <100ms, CLS <0.1 | Sin medir | MEDIO |
| **Responsive** | Mobile-first, PWA | Dashboard responsive ✅ | ✅ |
| **i18n** | Multi-idioma real | ES/EN/FR ✅ | ✅ |
| **Documentación** | API docs, guías de usuario | Parcial | MEDIO |

### Lo que esperan los usuarios B2B profesionales

1. **Confianza inmediata:** SSL visible, badges de seguridad, empresa identificada
2. **Onboarding claro:** Saber qué hacer después de registrarse (<3 clics al primer valor)
3. **Comunicación confiable:** Saber que el otro lado recibió el mensaje/propuesta
4. **Pagos seguros:** No enviar dinero a una plataforma sin garantía de devolución
5. **Documentación descargable:** Contratos, facturas, fichas técnicas en PDF
6. **Historial verificable:** Reseñas reales, track record, certificaciones verificadas
7. **Soporte accesible:** Chat de soporte o al menos email de contacto con respuesta
8. **Mobile funcional:** Fabricantes revisan propuestas desde el taller, no desde escritorio

---

## 7. PLAN DE ACCIÓN PRIORIZADO (48h hasta el 1 de abril)

### BLOQUE 1: SEGURIDAD URGENTE (4-6 horas)
> Sin estas correcciones, el despliegue es un riesgo inaceptable.

| # | Tarea | Tiempo est. | Archivos |
|---|-------|-------------|----------|
| ~~A1~~ | ~~**Rotar JWT_SECRET**~~ ✅ Completado 2026-03-31 | — | `src/lib/auth.ts` |
| ~~A2~~ | ~~**Agregar .env a .gitignore**~~ ✅ Ya estaba (`.env*`) | — | `.gitignore` |
| ~~A3~~ | ~~**Crear .env.example**~~ ✅ Completado 2026-03-31 | — | `.env.example` |
| ~~A4~~ | ~~**Agregar security headers**~~ ✅ Completado 2026-03-31 | — | `next.config.js` |
| ~~A5~~ | ~~**Eliminar bcrypt**~~ ✅ Completado 2026-03-31 | — | `package.json` |
| ~~A6~~ | ~~**Crear robots.txt**~~ ✅ Completado 2026-03-31 | — | `public/robots.txt` |
| A7 | **Validar que Pusher keys de prod son distintas a dev** | 10 min | Railway env vars |

### BLOQUE 2: FUNCIONALIDAD MÍNIMA (8-12 horas)
> Lo mínimo para que la plataforma sea usable por humanos reales.

| # | Tarea | Tiempo est. | Dependencia |
|---|-------|-------------|------------|
| ~~B1~~ | ~~**Recuperación de contraseña**~~ ✅ Completado 2026-03-31 (Resend + forgot/reset endpoints) | — | — |
| ~~B2~~ | ~~**Verificación de email**~~ ✅ Completado 2026-03-31 (token 24h + verify endpoint) | — | — |
| B3 | **Validación de adjudicación** (no permitir doble aceptación de propuesta) | 1-2h | Ninguna |
| B4 | **Notificaciones básicas** (crear notif al recibir propuesta/mensaje) | 2-3h | Ninguna |

### BLOQUE 3: DESPLIEGUE (2-4 horas)
> Configuración de Railway y verificación.

| # | Tarea | Tiempo est. |
|---|-------|-------------|
| C1 | Provisionar MySQL en Railway | 15 min |
| C2 | Ejecutar schema-railway.sql + seed-admins.sql | 30 min |
| C3 | Configurar 21 variables de entorno en Railway | 30 min |
| C4 | Deploy inicial + verificar health check | 30 min |
| C5 | Smoke testing manual (registro, login, crear RFQ, enviar propuesta, mensajes) | 1-2h |
| C6 | Configurar dominio custom (si existe) | 30 min |

### BLOQUE 4: POST-DEPLOY INMEDIATO (siguiente semana)
> Completar la experiencia profesional.

| # | Tarea | Prioridad |
|---|-------|-----------|
| ~~D1~~ | ~~Integrar Resend para emails transaccionales~~ ✅ Completado 2026-03-31 | ~~Alta~~ |
| D2 | Subida de archivos (Cloudinary o S3) | Alta |
| ~~D3~~ | ~~Pasarela de pagos (Stripe o Wompi)~~ ✅ Completado 2026-03-30 | ~~Alta~~ |
| D4 | Sentry para error tracking | Alta |
| D5 | Tests automatizados (al menos auth + RFQ flow) | Media |
| D6 | GitHub Actions CI/CD | Media |
| D7 | Páginas legales (T&C, Privacy Policy) | Media |
| D8 | Sitemap.xml dinámico | Baja |

---

## 8. RIESGOS Y MITIGACIONES

### Riesgos técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Build falla en Railway | Media | Alto | Probar `npm run build` local antes. Eliminar bcrypt nativo |
| MySQL connection timeout | Media | Alto | Verificar connection string format de Railway. Pool: 10 conn |
| Pusher API keys inválidas en prod | Baja | Medio | Verificar keys en Railway env. Chat tiene fallback polling |
| JWT_SECRET no configurado | Alta si se olvida | CRÍTICO | Quitar fallback en código + documentar en .env.example |
| Datos de test visibles en prod | Media | Alto | Ejecutar solo seed-admins.sql, NO seed.sql en producción |

### Riesgos de negocio

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Usuario registra, no puede recuperar contraseña | Alta | Alto | Implementar B1 antes de deploy |
| Fabricante no recibe notificación de nueva propuesta | Alta | Alto | Implementar B4 o al menos emails |
| Pago simulado genera confusión | Alta | Alto | Mostrar disclaimer claro: "Pagos en fase beta" |
| Disputas sin resolución | Media | Medio | Agregar email de contacto de soporte visible |
| Empresa falsa se registra | Alta | Medio | Verificación de email (B2) mitiga parcialmente |

---

## 9. VEREDICTO FINAL

### ¿Está FashionHubb listo para el 1 de abril?

**RESPUESTA HONESTA: NO para producción abierta al público. SÍ para un soft-launch controlado.**

#### Argumentación:

**Lo que funciona bien (60% del camino recorrido):**
- El flujo core (RFQ → Propuesta → Contrato → Milestones) está completo
- La mensajería en tiempo real funciona correctamente
- La arquitectura multi-rol es sólida
- El dashboard es funcional y responsive
- La internacionalización es completa
- La BD está bien diseñada y normalizada

**Lo que falta para producción real (40% restante):**
- Los pagos simulados invalidan el modelo de negocio
- Sin emails, la comunicación fuera de plataforma no existe
- Sin file upload, no se pueden adjuntar fichas técnicas
- Sin recuperación de contraseña, usuarios se pierden
- Los 6 issues de seguridad críticos crean exposición legal

### Recomendación: SOFT-LAUNCH CONTROLADO

**Si el 1 de abril es inamovible, deploy con estas condiciones:**

1. **Acceso por invitación** — no abrir registro público. Invitar 3-5 brands y 3-5 manufacturers de confianza
2. **Ejecutar Bloque 1 (seguridad)** — esto es INNEGOCIABLE, toma 4-6 horas
3. **Ejecutar Bloque 2 items B1 y B3** — recuperación de contraseña y validación de adjudicación
4. **Disclaimer visible** — "Plataforma en fase beta. Pagos procesados manualmente."
5. **Email de soporte visible** — para que usuarios reporten problemas
6. **Monitorear logs activamente** las primeras 48h post-deploy

**Para producción abierta, estimar 2-3 semanas adicionales** con los Bloques 3 y 4 completados.

---

## ANEXO A: Variables de entorno requeridas para Railway

```env
# === BASE DE DATOS ===
MYSQLHOST=<host-railway>
MYSQLPORT=<port-railway>
MYSQLUSER=<user-railway>
MYSQLPASSWORD=<password-railway-generada>
MYSQLDATABASE=railway
DATABASE_URL=mysql://<user>:<password>@<host>:<port>/railway

# === AUTENTICACIÓN ===
JWT_SECRET=<string-aleatorio-mínimo-64-chars>
JWT_EXPIRES_IN=7d

# === APLICACIÓN ===
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://<tu-dominio-railway>.up.railway.app
NEXT_PUBLIC_DEFAULT_CURRENCY=EUR

# === PUSHER (Realtime) ===
NEXT_PUBLIC_PUSHER_KEY=<pusher-key-produccion>
NEXT_PUBLIC_PUSHER_CLUSTER=<pusher-cluster>
PUSHER_KEY=<pusher-key-produccion>
PUSHER_SECRET=<pusher-secret-produccion>
PUSHER_APP_ID=<pusher-app-id-produccion>
```

## ANEXO B: Comparativa con competidores

| Feature | Manufy | Faire | FashionHubb |
|---------|--------|-------|-------------|
| Pagos escrow | ✅ | ✅ | ❌ |
| File upload | ✅ | ✅ | ❌ |
| Email notifications | ✅ | ✅ | ❌ |
| Real-time chat | ✅ | ❌ | ✅ |
| Green score | ✅ | ❌ | ✅ |
| Multi-idioma | ✅ (5) | ✅ (8) | ✅ (3) |
| RFQ system | ✅ | ❌ | ✅ |
| Verificación empresa | ✅ | ✅ | ❌ |
| Mobile app | ❌ | ✅ | ❌ |
| API pública | ❌ | ✅ | ❌ |
| MFA | ❌ | ✅ | ❌ |
| Contract milestones | ✅ | ❌ | ✅ |
