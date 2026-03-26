# Fase 5 — Optimización y Polish

## 1. Migración a Server Components

Componentes convertidos de `"use client"` + `useTranslations` a **async Server Components** con `getTranslations` de `next-intl/server`:

- `CTASection.tsx`
- `FinalCTASection.tsx`
- `TestimonialsSection.tsx`
- `Hero.tsx`
- `WhyManufySection.tsx`
- `PlatformSection.tsx`
- `QualitySection.tsx`
- `Footer.tsx` — también migró `useLocale` → `getLocale`

**Refactor `contacto/page.tsx`:** se extrajo la lógica interactiva del formulario a `ContactForm.tsx` (client component), y la página se reescribió como Server Component que importa Header, Footer y ContactForm.

> `PricingSection.tsx` se dejó como client component (usa `useState`).

---

## 2. Dynamic Imports (Code-Splitting)

- **DashboardLayout.tsx:** Reemplazó `import { AnimatePresence, motion } from "framer-motion"` por `import { DynamicAnimatePresence, dynamicMotion } from "@/lib/dynamic-motion"` — ahorra ~50 KB en todas las rutas del dashboard.
- **ProposalsCompare:** Cambió a `next/dynamic` con loading fallback — solo se carga cuando el usuario cambia a vista de tabla comparativa.

---

## 3. Accesibilidad

| Mejora | Archivo |
|--------|---------|
| `aria-label` + `aria-expanded` en botón menú móvil | `Header.tsx` |
| `aria-label` en selector de idioma | `Header.tsx` |
| `aria-label` en `<nav>` del sidebar | `Sidebar.tsx` |
| Skip-to-content link (`sr-only` → visible on focus) | `layout.tsx` |
| `id="main-content"` en `<main>` | `page.tsx` (home), `DashboardLayout.tsx` |

Claves i18n añadidas en los 3 idiomas: `openMenu`, `closeMenu`, `selectLanguage`, `navigationLabel`.

---

## 4. Optimización de Imágenes

Todas las `<img>` migradas a `next/image` para WebP automático, lazy loading y tamaños responsivos:

| Archivo | Imágenes convertidas |
|---------|---------------------|
| `Header.tsx` | 4 banderas de idioma |
| `MessagesPanel.tsx` | Logo de empresa |
| `manufacturers/page.tsx` | Logo de fabricante |
| `login/page.tsx` | 2 banderas |
| `register/page.tsx` | 2 banderas |
| `DashboardHeader.tsx` | 2 banderas de idioma |

`next.config.js` actualizado: añadido `flagcdn.com` a `domains` y `remotePatterns`.

---

## 5. Responsive — MessagesPanel Móvil

Patrón WhatsApp-like para pantallas pequeñas:

- **Sidebar:** `w-full md:w-[420px]` — ocupa todo el ancho en móvil, se oculta al seleccionar conversación.
- **Panel derecho:** Oculto en móvil cuando no hay conversación seleccionada.
- **Botones "back":** Añadidos en headers de chat pendiente y activo (`ArrowLeft`, visible solo en `md:hidden`).
- Todas las tablas del dashboard ya tenían `overflow-x-auto` (verificado).

---

## 6. Limpieza

- **Eliminado** `src/components/ui/page-template.tsx` — dead code, no se importaba en ningún lado.

---

## Build

✅ `next build` exitoso — 0 errores, 0 warnings.
