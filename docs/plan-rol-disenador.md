# Plan de Ruta — Rol de Diseñador en FashionsDen

**Autor:** Copilot  
**Fecha:** 2026-04-13  
**Estado:** Planificación

---

## 1. Visión General

Incorporar un tercer perfil de usuario: **Diseñador**, que ofrece servicios creativos a las marcas y puede colaborar de forma trilateral con fabricantes. El diseñador puede ser freelance o estudio de diseño.

### Modelo de Negocio
- Sin suscripción mensual
- Comisión por proyecto completado (% del valor del contrato)
- Publicación gratuita de portafolio/diseños

### Servicios del Diseñador
1. Diseño de colecciones por temporada
2. Tech packs / fichas técnicas
3. Diseño de patrones/moldes
4. Ilustración de moda
5. Consultoría de tendencias
6. Branding / identidad visual

### Flujos de Interacción
- **Flujo A (RFQ):** La marca publica un proyecto de diseño → diseñadores aplican con propuestas
- **Flujo B (Marketplace):** El diseñador publica diseños/colecciones → marcas contactan/compran
- **Flujo C (Trilateral):** Diseñador + Marca + Fabricante colaboran en un proyecto (el diseñador recomienda fabricantes)

---

## 2. Arquitectura de Datos

### 2.1 Cambios al Schema Existente

```
── Enums ──────────────────────────────────────────

users_role:         + designer
CompanyType:        + designer_studio   (para estudios)
subscription_plans_target_role: + designer

── Nuevo campo en User ────────────────────────────

User.is_freelance   Boolean  @default(false)
  → Si es true, no necesita company_id (perfil freelance)
  → Si es false, pertenece a un estudio (company con type=designer_studio)
```

### 2.2 Nuevos Modelos

```
── DesignerProfile ────────────────────────────────

id                  Int       @id
user_id             Int       @unique (relación 1:1 con User)
company_id          Int?      (null para freelancers)
display_name        String    (nombre artístico/profesional)
bio                 Text
specialties         JSON      (array de servicios: ["collections", "tech_packs", ...])
years_experience    Int?
portfolio_url       String?   (link externo opcional)
instagram_handle    String?
behance_url         String?
location_city       String?
location_country    String
availability_status Enum      (available, busy, unavailable)
hourly_rate_min     Decimal?
hourly_rate_max     Decimal?
currency            String    @default("USD")
is_verified         Boolean   @default(false)
rating_avg          Decimal   @default(0)
projects_completed  Int       @default(0)
created_at          DateTime
updated_at          DateTime

── DesignerPortfolioItem ──────────────────────────

id                  Int       @id
designer_profile_id Int       (FK → DesignerProfile)
title               String
description         Text?
category            String    (collection, tech_pack, pattern, illustration, branding)
season              String?   (SS26, FW26, Resort27, etc.)
year                Int?
images              JSON      (array de URLs de imágenes)
tags                JSON      (array de strings: ["silk", "minimalist", ...])
is_public           Boolean   @default(true)
views_count         Int       @default(0)
likes_count         Int       @default(0)
created_at          DateTime
updated_at          DateTime

── DesignProject (nuevo tipo de proyecto) ─────────

id                  Int       @id
code                String    @unique (formato: "DP-XXXX")
brand_company_id    Int       (FK → Company, la marca que contrata)
designer_profile_id Int?      (FK → DesignerProfile, null si aún no asignado)
category            String    (tipo de servicio solicitado)
title               String
description         Text
reference_images    JSON?     (imágenes de referencia)
season              String?
budget_min          Decimal?
budget_max          Decimal?
currency            String    @default("USD")
deadline            DateTime?
status              Enum      (draft, open, in_progress, review, completed, cancelled)
manufacturer_id     Int?      (FK → Company, para flujo trilateral)
created_at          DateTime
updated_at          DateTime

── DesignProposal ─────────────────────────────────

id                  Int       @id
design_project_id   Int       (FK → DesignProject)
designer_profile_id Int       (FK → DesignerProfile)
price               Decimal
estimated_days      Int
concept_notes       Text?
sample_attachments  JSON?     (bocetos/muestras adjuntas)
status              Enum      (submitted, shortlisted, accepted, rejected, withdrawn)
submitted_at        DateTime
responded_at        DateTime?

  @@unique([design_project_id, designer_profile_id])
```

---

## 3. Fases de Implementación

### FASE 1 — Fundamentos (Semana 1-2)

**Objetivo:** Registro, login y perfil del diseñador funcional

| Tarea | Archivos Afectados |
|-------|-------------------|
| Agregar `designer` a enum `users_role` | `prisma/schema.prisma` |
| Agregar `designer_studio` a enum `CompanyType` | `prisma/schema.prisma` |
| Crear modelo `DesignerProfile` | `prisma/schema.prisma` |
| Migración de BD | `prisma/migrations/` |
| Actualizar `UserRole` type | `src/types/user.ts` |
| Crear tipo `DesignerProfile` | `src/types/designer.ts` (nuevo) |
| Agregar opción "Soy Diseñador" al registro | `src/app/[locale]/register/page.tsx` |
| Flujo de registro: freelance vs estudio | `src/app/api/auth/register/route.ts` |
| Protección de rutas por rol | `src/middleware.ts` |
| Actualizar sidebar del dashboard | `src/components/layout/Sidebar.tsx` |
| Traducciones en 3 idiomas | `messages/en.json`, `es.json`, `fr.json` |

**Entregable:** Un diseñador puede registrarse, hacer login y ver su dashboard vacío.

---

### FASE 2 — Portfolio y Perfil Público (Semana 3-4)

**Objetivo:** El diseñador puede montar su portafolio y ser visible

| Tarea | Archivos Afectados |
|-------|-------------------|
| Crear modelo `DesignerPortfolioItem` | `prisma/schema.prisma` |
| Page: editar perfil de diseñador | `src/app/[locale]/dashboard/designer-profile/` (nuevo) |
| Upload de imágenes de portafolio | `src/app/api/designer/portfolio/route.ts` (nuevo) |
| Componente galería de portafolio | `src/components/designer/PortfolioGallery.tsx` (nuevo) |
| Filtros: categoría, temporada, tags | `src/components/designer/PortfolioFilters.tsx` (nuevo) |
| Perfil público del diseñador | `src/app/[locale]/designers/[slug]/page.tsx` (nuevo) |
| Directorio de diseñadores (browse) | `src/app/[locale]/designers/page.tsx` (nuevo) |
| Categorías de diseño (seed data) | `database/seed-designer-categories.sql` (nuevo) |

**Entregable:** Perfil público visible, portafolio con imágenes, directorio navegable.

---

### FASE 3 — Proyectos de Diseño / RFQ (Semana 5-6)

**Objetivo:** Las marcas pueden contratar diseñadores

| Tarea | Archivos Afectados |
|-------|-------------------|
| Crear modelos `DesignProject` + `DesignProposal` | `prisma/schema.prisma` |
| Page: crear proyecto de diseño (marca) | `src/app/[locale]/dashboard/design-projects/new/` (nuevo) |
| API: CRUD de design projects | `src/app/api/design-projects/route.ts` (nuevo) |
| Page: oportunidades de diseño (diseñador) | `src/app/[locale]/dashboard/design-opportunities/` (nuevo) |
| API: enviar propuesta de diseño | `src/app/api/design-proposals/route.ts` (nuevo) |
| Page: gestionar propuestas recibidas (marca) | `src/app/[locale]/dashboard/design-projects/[id]/` (nuevo) |
| Page: mis propuestas (diseñador) | `src/app/[locale]/dashboard/design-proposals/` (nuevo) |
| Notificaciones de nuevos proyectos | `src/lib/notifications.ts` |

**Entregable:** Flujo completo marca→proyecto→propuesta→aceptación.

---

### FASE 4 — Marketplace de Diseños (Semana 7-8)

**Objetivo:** Los diseñadores publican diseños para que las marcas los descubran

| Tarea | Archivos Afectados |
|-------|-------------------|
| Componente tarjeta de diseño | `src/components/designer/DesignCard.tsx` (nuevo) |
| Page: marketplace de diseños | `src/app/[locale]/design-marketplace/page.tsx` (nuevo) |
| Filtros: categoría, temporada, precio, estilo | Componentes de filtro (nuevos) |
| Botón "Contactar diseñador" | Integración con sistema de mensajes existente |
| Detalle de diseño con galería | `src/app/[locale]/design-marketplace/[id]/page.tsx` (nuevo) |
| Sistema de likes/guardados | `src/app/api/design-likes/route.ts` (nuevo) |
| SEO / metadata para diseños públicos | Metadata en pages |

**Entregable:** Marketplace funcional donde marcas descubren y contactan diseñadores.

---

### FASE 5 — Flujo Trilateral (Semana 9-10)

**Objetivo:** Diseñador + Marca + Fabricante trabajan juntos

| Tarea | Archivos Afectados |
|-------|-------------------|
| Vincular DesignProject con RfqProject | Campo `design_project_id` en `rfq_projects` |
| "Recomendar fabricante" desde diseñador | UI en el dashboard del diseñador |
| Conversaciones trilaterales | Extender modelo Conversation con designer_id |
| Vista unificada del proyecto | Page compartida entre los 3 roles |
| Contrato trilateral | Extender modelo Contract |
| Notificaciones trilaterales | `src/lib/notifications.ts` |

**Entregable:** Un proyecto puede fluir de diseño → producción con los 3 actores conectados.

---

### FASE 6 — Cobro por Comisión y Pagos (Semana 11-12)

**Objetivo:** Monetización del diseñador

| Tarea | Archivos Afectados |
|-------|-------------------|
| Stripe Connect para diseñadores | `src/lib/stripe.ts` |
| Comisión automática por proyecto completado | `src/app/api/stripe/webhook/route.ts` |
| Dashboard de ingresos del diseñador | `src/app/[locale]/dashboard/earnings/` (nuevo) |
| Historial de pagos recibidos | Componentes de pagos |
| Configuración de método de cobro | `src/app/[locale]/dashboard/payout-settings/` (nuevo) |

**Entregable:** El diseñador cobra comisión automáticamente al completar proyectos.

---

## 4. Dashboard del Diseñador

### Navegación (Sidebar)

```
📊  Dashboard Home
👤  Mi Perfil
🎨  Mi Portafolio
📝  Mis Propuestas
💼  Oportunidades de Diseño
📦  Proyectos Activos
💬  Mensajes
💰  Ingresos
⭐  Reseñas
⚙️  Configuración
```

### Dashboard Home — Widgets

| Widget | Descripción |
|--------|-------------|
| Estadísticas rápidas | Proyectos activos, propuestas pendientes, ingresos del mes |
| Nuevas oportunidades | Últimos proyectos de diseño publicados por marcas |
| Portafolio highlights | Items más vistos/likeados |
| Reviews recientes | Últimas reseñas recibidas |
| Disponibilidad toggle | Cambiar estado: Disponible / Ocupado / No disponible |

---

## 5. Categorías de Diseño

| Slug | Nombre EN | Nombre ES |
|------|-----------|-----------|
| `collections` | Collection Design | Diseño de Colecciones |
| `tech_packs` | Tech Packs | Fichas Técnicas |
| `patterns` | Pattern Making | Patronaje / Moldes |
| `illustration` | Fashion Illustration | Ilustración de Moda |
| `trend_consulting` | Trend Consulting | Consultoría de Tendencias |
| `branding` | Brand Identity | Identidad de Marca |

---

## 6. Impacto en Código Existente

### Archivos que requieren modificación

| Archivo | Cambio |
|---------|--------|
| `prisma/schema.prisma` | Nuevos modelos, enums actualizados |
| `src/types/user.ts` | Agregar `designer` a `UserRole` |
| `src/types/company.ts` | Agregar `designer_studio` a `CompanyType` |
| `src/middleware.ts` | Protección de rutas para designer |
| `src/components/layout/Sidebar.tsx` | Sección designer en sidebar |
| `src/components/layout/Header.tsx` | Nav link a directorio de diseñadores |
| `src/app/[locale]/register/page.tsx` | Tercera opción de registro |
| `src/app/api/auth/register/route.ts` | Lógica de registro designer |
| `messages/*.json` | Traducciones del nuevo módulo |
| `src/components/layout/Footer.tsx` | Link a marketplace de diseñadores |

### Archivos nuevos principales (~30 archivos)

- `src/types/designer.ts`
- `src/app/[locale]/dashboard/designer-profile/page.tsx`
- `src/app/[locale]/dashboard/designer-portfolio/page.tsx`
- `src/app/[locale]/dashboard/design-opportunities/page.tsx`
- `src/app/[locale]/dashboard/design-proposals/page.tsx`
- `src/app/[locale]/dashboard/earnings/page.tsx`
- `src/app/[locale]/designers/page.tsx`
- `src/app/[locale]/designers/[slug]/page.tsx`
- `src/app/[locale]/design-marketplace/page.tsx`
- `src/app/[locale]/design-marketplace/[id]/page.tsx`
- `src/app/api/designer/profile/route.ts`
- `src/app/api/designer/portfolio/route.ts`
- `src/app/api/design-projects/route.ts`
- `src/app/api/design-proposals/route.ts`
- `src/components/designer/DesignCard.tsx`
- `src/components/designer/PortfolioGallery.tsx`
- `src/components/designer/DesignerProfileCard.tsx`

---

## 7. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Migración de BD con datos existentes | Alto | Migraciones incrementales, campos nullable |
| Complejidad del flujo trilateral | Alto | Implementar en fase separada (fase 5) |
| Stripe Connect requiere onboarding | Medio | Fase 6 independiente, comisión manual al inicio |
| Exceso de categorías/servicios | Bajo | Empezar con 6 categorías fijas, expandir después |
| Conflicto con middleware de roles | Medio | Tests de integración antes de merge |

---

## 8. Prioridad de Ejecución

```
FASE 1 ──▶ FASE 2 ──▶ FASE 3 ──▶ FASE 4 ──▶ FASE 5 ──▶ FASE 6
Registro    Portfolio   RFQ diseño  Marketplace  Trilateral  Pagos
(fundament) (visible)   (negocio)   (descubrir)  (collab)    ($$)
```

> **MVP mínimo viable:** Fases 1 + 2 + 3 — el diseñador puede registrarse, montar portafolio y recibir proyectos de marcas.

---

## 9. Siguiente Paso

Dime **qué fase quieres empezar** y la implemento.
