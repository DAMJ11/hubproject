# Guía de Contribución — FASHIONS DEN

## 1. Reglas de Código

### Prohibido
- **NO** hardcodear colores hex (`#2563eb`, `#f0f5f3`…).
  Usar tokens de Tailwind (`bg-brand-600`, `bg-landing-gradient`, `text-landing-cta`).
  Si el color no existe como token, crear una CSS var en `globals.css` y mapearlo en `tailwind.config.ts`.
- **NO** crear componentes `"use client"` sin justificación.
  Por defecto todo es Server Component. Solo usar `"use client"` cuando se necesita estado, efectos, o event handlers.
- **NO** agregar dependencias sin evaluar peso en [bundlephobia.com](https://bundlephobia.com).

### Obligatorio
- **SÍ** usar `<StatusBadge entity="..." status="..." />` para cualquier badge de estado.
  Antes de crear un badge manual, verificar si la entidad existe en `src/lib/status-config.ts`.
  Si no existe, agregarla ahí con sus variantes.
- **SÍ** usar `<EmptyState icon={...} title="..." />` para cualquier lista que pueda estar vacía.
- **SÍ** usar `toast.success()` / `toast.error()` (Sonner) para cualquier acción que cambie estado.
- **SÍ** usar `<AlertDialog>` para acciones destructivas (eliminar, rechazar, cancelar).

---

## 2. Naming Conventions

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase | `StatusBadge.tsx`, `EmptyState.tsx` |
| Hooks | camelCase con prefijo `use` | `useProposals.ts`, `useContractStatus.ts` |
| Utils / lib | camelCase | `statusConfig.ts`, `formatCurrency.ts` |
| CSS vars | kebab-case con prefijo | `--brand-600`, `--landing-gradient` |
| i18n keys | `PascalCase.camelCase` | `Contracts.status.inProduction` |

### Excepciones
- Archivos en `src/components/ui/` siguen la convención de **shadcn/ui** (kebab-case) para compatibilidad con `npx shadcn@latest add`.
- Archivos especiales de Next.js (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) mantienen su nombre obligatorio.

---

## 3. Tokens de Color

Los colores compartidos están definidos como CSS vars en `globals.css` y mapeados en `tailwind.config.ts`:

```
/* globals.css :root */
--landing-gradient   → bg-landing-gradient / from-landing-gradient
--landing-light      → bg-landing-light
--landing-neutral    → bg-landing-neutral
--landing-cta        → bg-landing-cta / text-landing-cta
--landing-beige      → bg-landing-beige
--landing-beige-border → border-landing-beige-border
--brand-50 … --brand-900 → bg-brand-600, text-brand-700, etc.
```

---

## 4. Checklist para Cada Nueva Feature

Antes de hacer merge, verificar:

- [ ] **¿Es Server Component por defecto?** Si usa `"use client"`, ¿por qué?
- [ ] **¿Tiene empty state?** Usar `<EmptyState>` de `@/components/shared/empty-state`
- [ ] **¿Tiene skeleton loader?** Crear `loading.tsx` con `CardSkeleton` / `TableSkeleton`
- [ ] **¿Las acciones muestran toast?** `toast.success()` / `toast.error()` de Sonner
- [ ] **¿Las acciones destructivas piden confirmación?** Usar `<AlertDialog>`
- [ ] **¿Usa colores del status-config?** No hardcodear colores para badges de estado
- [ ] **¿Traducciones en los 3 idiomas?** `es.json`, `en.json`, `fr.json`
- [ ] **¿Responsive?** Mobile → Desktop (mobile-first)
- [ ] **¿Accesible?** `aria-label` en botones de icono, navegación por teclado

---

## 5. Componentes Compartidos

| Componente | Ubicación | Uso |
|-----------|-----------|-----|
| `StatusBadge` | `src/components/shared/status-badge.tsx` | Badges de estado con colores centralizados |
| `EmptyState` | `src/components/shared/empty-state.tsx` | Estado vacío para listas/tablas |
| `CardSkeleton` | `src/components/shared/skeleton-loader.tsx` | Skeleton para cards durante carga |
| `TableSkeleton` | `src/components/shared/skeleton-loader.tsx` | Skeleton para tablas |
| `PageSkeleton` | `src/components/shared/skeleton-loader.tsx` | Skeleton de página completa |

## 6. Entidades de Estado (status-config.ts)

Entidades soportadas: `contracts`, `projects`, `proposals`, `payments`, `users`, `certifications`.

Para agregar una nueva entidad:
1. Añadir los estados en `src/lib/status-config.ts`
2. Actualizar el tipo `StatusEntity`
3. Agregar las traducciones `NombreEntidad.status.nombreEstado` en los 3 idiomas
