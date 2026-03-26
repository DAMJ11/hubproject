# Fase 4 — Flujos UX Clave

## Resumen

Fase 4 del roadmap UX/UI de Fashions Den. Se crearon 4 flujos interactivos nuevos, se aplicó dark mode a **todas** las páginas del proyecto y se integró React Hook Form + Zod para validación de formularios.

---

## 1. Formulario Multi-Paso RFQ (`rfq-form.tsx`)

**Archivo:** `src/app/[locale]/dashboard/projects/new/rfq-form.tsx`

- Wizard de 4 pasos: Básico → Presupuesto/Fechas → Materiales → Revisión
- Stepper visual con iconos, estados done/active/pending
- React Hook Form + Zod v4 + zodResolver
- `useFieldArray` para materiales dinámicos (añadir/eliminar)
- Paso de revisión con todos los campos antes de enviar
- Validación por paso con `trigger()` antes de avanzar

**Nota técnica:** `z.coerce.number()` de Zod v4 es incompatible con `@hookform/resolvers`. Se usan campos `z.string()` y conversión manual con `Number()` antes del submit.

---

## 2. Vista de Comparación de Propuestas (`proposals-compare.tsx`)

**Archivo:** `src/app/[locale]/dashboard/projects/[id]/proposals-compare.tsx`

- Tabla comparativa lado a lado de propuestas recibidas
- Ordenable por: precio, tiempo de entrega, green score, distancia
- Resaltado automático del mejor valor por columna
- Toggle cards/compare en la página de detalle del proyecto

---

## 3. Timeline de Hitos (`milestone-timeline.tsx`)

**Archivo:** `src/app/[locale]/dashboard/contracts/[id]/milestone-timeline.tsx`

- Timeline vertical visual con estados: pending, in_progress, completed
- Barra de progreso general del contrato
- Formateo de fechas con `Intl.DateTimeFormat` según locale
- Iconos por estado: Clock, Loader2, CheckCircle2

---

## 4. Onboarding Post-Registro (`onboarding/page.tsx`)

**Archivo:** `src/app/[locale]/dashboard/onboarding/page.tsx`

- Wizard de 3 pasos: Info Empresa → Ubicación → Detalles
- 3 instancias de `useForm` independientes (una por paso)
- PATCH a `/api/companies/me` en cada paso
- Redirige a `/dashboard` al completar
- Redirect desde `/register` ahora apunta a `/dashboard/onboarding`

**Endpoint creado:** `src/app/api/companies/me/route.ts` (GET company del usuario actual)

---

## 5. Dark Mode Completo

Se aplicaron variantes `dark:` a **todas** las páginas y componentes del proyecto:

### Páginas públicas
- `para-marcas/page.tsx` — Hero gradient, secciones, cards, features, CTA
- `para-fabricantes/page.tsx` — Hero, pricing cards, planes, features, CTA
- `politica-sostenibilidad/page.tsx` — Hero, pilares, cards, CTA
- `noticias/page.tsx` — Hero, sección de noticias, cards
- `recursos/page.tsx` — Hero, sección de recursos, cards

### Dashboard
- `Sidebar.tsx` — Botones, búsqueda, nav items, sub-items
- `DashboardLayout.tsx` — Loading state
- **`MessagesPanel.tsx`** — Refactoring masivo: 100+ colores hex hardcodeados convertidos a clases Tailwind semánticas con variantes `dark:`

### Mapeo de colores aplicado
| Hex / Clase light | Clase dark |
|---|---|
| `bg-white` | `dark:bg-slate-900` (página) / `dark:bg-slate-800` (card) |
| `text-gray-900` | `dark:text-white` |
| `text-gray-600` | `dark:text-gray-400` |
| `border-gray-200` | `dark:border-slate-700` |
| `bg-gray-50` | `dark:bg-slate-800` |
| `bg-gray-100` | `dark:bg-slate-700` |

---

## 6. Dependencias Instaladas

- `react-hook-form` — Gestión de formularios
- `@hookform/resolvers` — Integración Zod con RHF

---

## 7. i18n — Claves Añadidas

Archivos: `messages/es.json`, `messages/en.json`, `messages/fr.json`

- `ProjectNew.*` — Formulario multi-paso RFQ (campos, pasos, placeholders, botones)
- `ProjectDetail.compare` — Vista de comparación
- `Onboarding.*` — Wizard de onboarding (3 pasos, campos, botones)

---

## 8. Bugs Corregidos Durante Build

| Error | Archivo | Fix |
|---|---|---|
| `z.coerce.number()` tipo `unknown` con zodResolver | `onboarding/page.tsx` | Cambio a `z.string()` + `Number()` manual |
| `z.coerce.number()` tipo `unknown` con zodResolver | `rfq-form.tsx` | Cambio a `z.string()` + `Number()` manual |
| Hook condicional `useLocale()` | `milestone-timeline.tsx` | Llamada incondicional + `??` después |
| Import faltante `CheckCircle` | `contracts/[id]/page.tsx` | Añadido al import de lucide-react |
| JSX roto (tags faltantes) | `sobre-nosotros/page.tsx` | Restauración de `<div>` y `<h2>` |

---

## Build

✅ `npx next build` — Compilación exitosa sin errores.
