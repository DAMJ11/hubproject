# Plan de Ruta — Abril 2026

> Roadmap para: Super Usuario, Admin CRUD avanzado, Facturación/Contratos en Chat, y limpieza de UI.

---

## Resumen de lo que YA EXISTE y se puede reutilizar

| Sistema | Estado | Qué hay |
|---------|--------|---------|
| Roles (`UserRole`) | ✅ `brand`, `manufacturer`, `admin` | Enum en Prisma, `hasRole()` helper, sidebar por rol |
| Admin Dashboard | ✅ Funcional pero con strings hardcoded en español | `DashboardHome` + `AdminDashboard`, API `/api/dashboard/stats` |
| Companies admin | ✅ Lista con filtro tipo/búsqueda | Página `/dashboard/companies`, API `/api/companies/search` |
| Users admin | ✅ Lista básica | Página `/dashboard/users` |
| Contratos | ✅ Creación auto al aceptar propuesta, 5 milestones | Modelo `Contract` + `ContractMilestone`, timeline visual |
| Chat realtime | ✅ Pusher, canales privados, moderación | `MessagesPanel`, API conversations/messages |
| Notificaciones | ✅ Modelo + API GET/PATCH | `Notification` model, `createNotification()` helper |
| Pagos Stripe | ✅ Suscripciones + Setup Intent + Strategy Call | Webhooks, checkout sessions |
| Modelo `Payment` | ⚠️ Existe en BD pero SIN API de procesamiento | Tiene `payer`, `payee`, `amount`, `status`, `transaction_id` |
| Facturación milestones | ❌ No existe | No hay invoice, no hay Stripe por milestone |
| Subscription tab | ✅ Existe pero NO se usará | Tab "billing" en settings-form.tsx |

---

## FASE 0 — Limpieza UI inmediata (1-2 días)

### 0.1 Traducir dashboard admin completamente
- **Problema**: `src/lib/data/dashboard.ts` y `/api/dashboard/stats/route.ts` tienen labels hardcoded: "Empresas Activas", "Proyectos Abiertos", "Contratos Activos", "Ingresos".
- **Solución**: Usar claves de traducción en `DashboardHome` (componente cliente) en lugar del server data loader. Agregar keys a `en.json`, `es.json`, `fr.json`.
- **Archivos**: `src/lib/data/dashboard.ts`, `src/components/dashboard/DashboardHome.tsx`, `messages/*.json`

### 0.2 Eliminar tab Subscription de Settings
- **Problema**: Imagen 4 — "Error loading billing information". No habrá suscripciones.
- **Solución**: Quitar el `<TabsTrigger value="billing">` y el `<TabsContent value="billing">` completo de `settings-form.tsx`. Limpiar estados `billingLoading`, `billingData`, `billingError`, `fetchBilling`.
- **Archivos**: `src/app/[locale]/dashboard/settings/settings-form.tsx`, `messages/*.json` (quitar keys de Subscription)

### 0.3 Limpiar modelos de suscripción (opcional, puede dejarse para después)
- Modelo `SubscriptionPlan`, `Subscription`, `SubscriptionInvoice` y API `/api/subscriptions`, `/api/stripe/checkout` pueden permanecer inactivos o eliminarse después.

---

## FASE 1 — Rol Super Usuario (2-3 días)

### 1.1 Agregar `super_admin` al enum `UserRole`
```prisma
enum UserRole {
  brand
  manufacturer
  admin
  super_admin
}
```
- Crear migración Prisma
- Actualizar `seed-admins.sql` para marcar cuenta CEO como `super_admin`

### 1.2 Actualizar `hasRole()` y guards
- `hasRole(user, "admin")` debe también retornar `true` para `super_admin` (herencia de permisos)
- Crear helper `isSuperAdmin(user)` para checks exclusivos
- **Archivo**: `src/lib/session.ts`

### 1.3 Sidebar y UI para super_admin
- `super_admin` ve todo lo que ve `admin` + badge diferenciado ("Super Admin" en púrpura/rojo)
- Agregar items extra en sidebar si aplica (ej: "Assign Projects")
- **Archivo**: `src/components/layout/Sidebar.tsx`

### 1.4 Traducciones
- Agregar keys para super_admin en los 3 idiomas

---

## FASE 2 — Admin CRUD avanzado de Companies (2-3 días)

### 2.1 Vista detalle de empresa (admin)
- **Ruta**: `/dashboard/companies/[id]`
- **Contenido**: Datos completos de la empresa, logo, descripción, ubicación, empleados, fecha fundación, tipo (brand/manufacturer), usuario propietario, verificación
- **API**: `GET /api/admin/companies/[id]` — retorna empresa + owner + stats(proyectos, propuestas, contratos)

### 2.2 Acciones admin sobre empresa
- **Editar** datos internos (nombre, descripción, ubicación, categorías) → `PUT /api/admin/companies/[id]`
- **Bloquear/Desbloquear** → campo `is_blocked` (nuevo) en `Company` o toggle `is_active` en el usuario owner → `PATCH /api/admin/companies/[id]/status`
- **Eliminar** (soft delete recomendado) → `DELETE /api/admin/companies/[id]`
- **Verificar** marca de verificación → `PATCH /api/admin/companies/[id]/verify`
- UI: Botones en la vista detalle + menú contextual en tarjetas de la lista

### 2.3 CRUD de Usuarios (admin/super_admin)
- **Vista actual**: `/dashboard/users` ya lista usuarios
- **Ampliar**: Detalle de usuario, editar rol, bloquear, eliminar
- **Solo super_admin**: Puede cambiar rol a `admin` o quitar admin
- **API**: 
  - `GET /api/admin/users/[id]`
  - `PUT /api/admin/users/[id]` (editar)
  - `PATCH /api/admin/users/[id]/role` (cambiar rol — **solo super_admin**)
  - `PATCH /api/admin/users/[id]/status` (activar/desactivar)
  - `DELETE /api/admin/users/[id]` (soft delete)

---

## FASE 3 — Admin: Edición de Proyectos + Comentarios (1-2 días)

### 3.1 Editar proyecto desde admin
- **Ruta**: `/dashboard/rfq/[id]` (ya existe vista detalle admin)
- **Nuevo**: Botón "Edit" visible solo para admin/super_admin
- **API**: `PUT /api/admin/rfq/[id]` — permite modificar título, descripción, materiales, cantidad, presupuesto, deadline, categorías, estado
- **Nota**: El título del proyecto lo puso el usuario en español; el admin puede editarlo pero **no se traduce automáticamente** (es contenido del usuario)

### 3.2 Caja de comentarios/notas admin
- **Modelo nuevo**: `AdminNote`
```prisma
model AdminNote {
  id          Int      @id @default(autoincrement())
  entity_type String   // "rfq_project" | "company" | "user" | "contract"  
  entity_id   Int
  admin_id    Int
  content     String   @db.Text
  created_at  DateTime @default(now())
  admin       User     @relation(fields: [admin_id], references: [id])
  @@index([entity_type, entity_id])
}
```
- **UI**: Panel colapsable "Admin Notes" en detalle de proyecto, empresa, usuario, contrato
- **API**: `GET/POST /api/admin/notes?entity_type=rfq_project&entity_id=4`
- Solo visible para admin/super_admin

---

## FASE 4 — Super Admin: Crear y Asignar Proyectos (3-4 días)

### 4.1 Super Admin crea proyecto para una marca
- **UI**: Botón "Create Project for Brand" en `/dashboard/rfq` o en detalle de empresa brand
- **Flujo**: 
  1. Seleccionar marca destino (dropdown de companies tipo brand)
  2. Completar formulario RFQ (reutilizar `rfq-form.tsx` con adaptaciones)
  3. Se crea el proyecto con `created_by_admin_id` extra (campo nuevo en `RfqProject`)
  4. Notificación a la marca: "An administrator has created a project on your behalf"
- **API**: `POST /api/admin/rfq` — similar a POST `/api/rfq` pero con `brand_company_id` explícito

### 4.2 Super Admin asigna proyecto a fabricante
- **Concepto**: El super admin puede "adjudicar" directamente un proyecto de marca a un fabricante, **sin** pasar por el flujo de propuestas.
- **UI**: Botón "Assign to Manufacturer" en detalle del proyecto (solo super_admin)
  1. Modal: seleccionar manufacturer (búsqueda por nombre)
  2. Definir monto del contrato y términos básicos
  3. Confirmar asignación
- **Backend** (`POST /api/admin/rfq/[id]/assign`):
  1. Crear contrato directo (sin propuesta intermedia)
  2. Actualizar RFQ status → `awarded`
  3. Crear conversación entre brand y manufacturer con contexto RFQ
  4. **Notificación al fabricante**: "A senior administrator has assigned you the project: [título]. Please review the contract details."
  5. **Notificación a la marca**: "Your project [título] has been assigned to [manufacturer]."

### 4.3 Campo `created_by_admin_id` en RfqProject
```prisma
model RfqProject {
  // ... campos existentes ...
  created_by_admin_id Int?
  created_by_admin    User?  @relation("AdminCreatedProjects", fields: [created_by_admin_id], references: [id])
}
```

---

## FASE 5 — Sistema de Facturación y Negociación de Precio (4-5 días)

> Esta es la fase más compleja. Se construye sobre el sistema de contratos y chat existente.

### 5.1 Modelo `Invoice` (Factura/Orden)
```prisma
model Invoice {
  id                Int             @id @default(autoincrement())
  code              String          @unique  // INV-2026-001
  contract_id       Int
  contract          Contract        @relation(fields: [contract_id], references: [id])
  
  // Montos
  production_cost   Decimal         @db.Decimal(10, 2)
  shipping_cost     Decimal         @default(0) @db.Decimal(10, 2)
  other_costs       Decimal         @default(0) @db.Decimal(10, 2)
  subtotal          Decimal         @db.Decimal(10, 2)
  tax_rate          Decimal         @default(0) @db.Decimal(5, 2)
  tax_amount        Decimal         @default(0) @db.Decimal(10, 2)
  platform_fee_rate Decimal         @default(3) @db.Decimal(5, 2)  // 3% buyer protection
  platform_fee      Decimal         @default(0) @db.Decimal(10, 2)
  total             Decimal         @db.Decimal(10, 2)
  currency          String          @default("EUR")
  
  // Negociación
  status            InvoiceStatus   @default(draft)
  proposed_by       Int             // user_id que propone
  proposed_by_user  User            @relation(fields: [proposed_by], references: [id])
  notes             String?         @db.Text
  
  // Pago
  paid_at           DateTime?
  stripe_payment_intent_id String?
  
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  
  @@index([contract_id])
}

enum InvoiceStatus {
  draft              // Borrador, no enviada
  pending_approval   // Enviada, esperando que la otra parte apruebe
  revision_requested // La otra parte pidió cambios
  approved           // Ambas partes de acuerdo
  payment_processing // Pago en proceso por Stripe
  paid               // Pagada exitosamente
  cancelled          // Cancelada
}
```

### 5.2 Flujo de negociación de factura

```
1. Fabricante acepta propuesta → se crea Contrato + Conversación
2. En el chat, cualquiera puede iniciar "Crear Factura" 
   → Se genera Invoice (status: draft)
   → Aparece como tarjeta embebida en el chat (tipo mensaje "system/invoice")
3. Otra parte revisa → puede "Aprobar" o "Solicitar Revisión"
   → Si revision_requested: proponente edita montos y reenvía
   → Loop hasta que ambos aprueban
4. Status → approved → aparece botón "Pay with Stripe"
5. Brand paga via Stripe Payment Intent
6. Webhook confirma → status = paid → inicia countdown de fabricación
```

### 5.3 API Endpoints de Invoice
- `POST /api/contracts/[id]/invoices` — Crear factura borrador
- `GET /api/contracts/[id]/invoices` — Listar facturas del contrato
- `GET /api/invoices/[id]` — Detalle de factura
- `PUT /api/invoices/[id]` — Editar montos (solo si draft o revision_requested)
- `PATCH /api/invoices/[id]/submit` — Enviar para aprobación
- `PATCH /api/invoices/[id]/approve` — Aprobar factura
- `PATCH /api/invoices/[id]/request-revision` — Pedir cambios (con nota)
- `POST /api/invoices/[id]/pay` — Crear Stripe Payment Intent
- Webhook: `payment_intent.succeeded` → marcar como paid

### 5.4 Tarjeta de factura en el chat
- Nuevo tipo de mensaje: `type: "invoice"` con `reference_id` apuntando a `Invoice.id`
- Renderizar como tarjeta visual (similar a Imagen 5):
  - Título: "Sample Order" → nombre del proyecto
  - Desglose: Production, Shipping, Other, Subtotal, VAT, Platform Fee, Total
  - Botones: "Approve" / "Request Changes" / "Pay Now"
- Cada cambio de estado genera un mensaje sistema en la conversación

### 5.5 Sección de Facturas/Contratos en Dashboard
- **Ruta existente**: `/dashboard/contracts/[id]` — agregar pestaña "Invoices"
- **Vista**: Lista de facturas del contrato con estado, monto, fecha
- **Detalle de factura**: Desglose completo, historial de revisiones, botón de pago

### 5.6 Stripe Payment Intent para contratos
- Usar `stripe.paymentIntents.create()` (no Checkout Session, para mayor control)
- Monto = factura.total (en centavos)
- Metadata: `invoice_id`, `contract_id`, `brand_company_id`, `manufacturer_company_id`
- Transfer al manufacturer (Stripe Connect si aplica, o manual payout)
- **Fee**: Platform fee del 3% retenido (configurable)
- Webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## FASE 6 — Notificaciones para asignación y facturación (1-2 días)

### 6.1 Nuevos tipos de notificación
- `project_assigned`: "A senior administrator has assigned you project [X]"
- `project_created_for_brand`: "An administrator created project [X] on your behalf"
- `invoice_submitted`: "New invoice for contract [CTR-XXX] awaiting your approval"
- `invoice_approved`: "Invoice approved — proceed to payment"
- `invoice_revision`: "Revision requested on invoice for [CTR-XXX]"
- `invoice_paid`: "Payment received for contract [CTR-XXX]"
- `manufacturing_started`: "Manufacturing has started for [project]"

### 6.2 Emails (futuro, con Resend)
- Las notificaciones críticas (asignación, pago) deberían también enviar email
- Usar el skill de Resend ya documentado en el proyecto

---

## Orden de implementación recomendado

| # | Fase | Dependencias | Prioridad |
|---|------|-------------|-----------|
| 0 | Limpieza UI (traducciones + quitar subscriptions) | Ninguna | 🔴 Alta — Visible al usuario |
| 1 | Rol super_admin | Ninguna | 🔴 Alta — Base para todo lo admin |
| 2 | Admin CRUD Companies + Users | Fase 1 | 🔴 Alta — Funcionalidad core admin |
| 3 | Admin: Editar proyectos + Notas admin | Fases 1-2 | 🟡 Media |
| 4 | Super Admin: Crear/Asignar proyectos | Fases 1-3 | 🟡 Media |
| 5 | Facturación y negociación de precio | Fase 0-2 | 🔴 Alta — Core del negocio |
| 6 | Notificaciones avanzadas + emails | Fases 4-5 | 🟢 Normal |

### Estimación total: ~15-20 días de desarrollo

---

## Migración de base de datos requerida

```sql
-- Fase 1: super_admin role
ALTER TABLE users MODIFY COLUMN role ENUM('brand','manufacturer','admin','super_admin') DEFAULT 'brand';

-- Fase 2: Company block
ALTER TABLE companies ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN blocked_at DATETIME NULL;
ALTER TABLE companies ADD COLUMN blocked_by INT NULL;

-- Fase 3: Admin notes
CREATE TABLE admin_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  admin_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Fase 4: Admin-created projects
ALTER TABLE rfq_projects ADD COLUMN created_by_admin_id INT NULL;
ALTER TABLE rfq_projects ADD CONSTRAINT fk_rfq_admin FOREIGN KEY (created_by_admin_id) REFERENCES users(id);

-- Fase 5: Invoices
CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  contract_id INT NOT NULL,
  production_cost DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  other_costs DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  platform_fee_rate DECIMAL(5,2) DEFAULT 3,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status ENUM('draft','pending_approval','revision_requested','approved','payment_processing','paid','cancelled') DEFAULT 'draft',
  proposed_by INT NOT NULL,
  notes TEXT,
  paid_at DATETIME NULL,
  stripe_payment_intent_id VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contract (contract_id),
  FOREIGN KEY (contract_id) REFERENCES contracts(id),
  FOREIGN KEY (proposed_by) REFERENCES users(id)
);
```

---

## Notas técnicas

- **Stripe Payment Intent vs Checkout Session**: Para facturas usamos Payment Intent directamente porque el monto ya está acordado y queremos control total del flujo dentro del chat.
- **Herencia de permisos**: `super_admin` hereda todo de `admin`. La función `hasRole()` se modifica para que `hasRole(user, "admin")` retorne true también para super_admin.
- **Soft delete**: No se borran registros, se desactivan (`is_active = false`, `is_blocked = true`).
- **Chat invoice cards**: Se reutiliza el sistema de mensajes existente con `type: "invoice"` y `metadata` JSON.
- **Modelo Payment existente**: Se puede reusar para registrar el pago real de la factura vía Stripe, vinculándolo a la invoice.
