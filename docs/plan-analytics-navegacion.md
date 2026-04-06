# Plan de Acción: Analytics de Navegación — FashionsDen

## Objetivo
Recopilar y visualizar datos de comportamiento de usuarios en la plataforma para responder:

| # | Pregunta clave | Métrica |
|---|---------------|---------|
| 1 | ¿Cuántos llegan al día? | Visitantes únicos diarios / Pageviews |
| 2 | ¿De dónde visitan? | Referrer, UTM, país, dispositivo |
| 3 | ¿Cuánto tiempo navegan? | Duración de sesión, tiempo en página |
| 4 | ¿Regresan? | Tasa de retorno, frecuencia de visita |
| 5 | ¿A dónde se van y a dónde vuelven? | Flujo de navegación, páginas de salida/entrada |
| 6 | ¿Por qué no se registran? | Funnel de conversión, drop-offs, grabación de sesiones |

---

## Herramienta recomendada: PostHog

### ¿Por qué PostHog?

| Criterio | PostHog | Google Analytics 4 | Mixpanel |
|----------|---------|-------------------|----------|
| Autocapture (pageviews, clicks) | ✅ | ✅ | ❌ manual |
| Session recordings | ✅ gratis | ❌ necesita Hotjar | ❌ |
| Funnels de conversión | ✅ | ✅ limitado | ✅ |
| Heatmaps | ✅ | ❌ | ❌ |
| Paths/flujos de navegación | ✅ | ✅ | ✅ |
| Retención de usuarios | ✅ | ✅ básico | ✅ |
| Feature flags | ✅ | ❌ | ❌ |
| Surveys in-app | ✅ | ❌ | ❌ |
| Open source | ✅ | ❌ | ❌ |
| Free tier generoso | 1M eventos/mes | Ilimitado | 20M eventos/mes |
| SDK Next.js nativo | ✅ `posthog-js/react` | Manual con gtag | Manual |
| Privacidad (EU/GDPR) | ✅ EU hosting | ⚠️ datos en Google | ⚠️ US only |
| Dashboard interno | ✅ | ✅ externo | ✅ externo |

**Veredicto**: PostHog cubre TODAS las 6 preguntas con una sola herramienta y tiene integración nativa con Next.js.

---

## Arquitectura propuesta

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
│                                                  │
│  PostHogProvider (layout.tsx)                     │
│    ├─ Autocapture: pageviews, clicks, inputs     │
│    ├─ Session recordings                         │
│    └─ Custom events:                             │
│        ├─ registration_started                   │
│        ├─ registration_step_completed            │
│        ├─ registration_abandoned                 │
│        ├─ login_attempted                        │
│        ├─ login_success                          │
│        ├─ google_oauth_clicked                   │
│        ├─ pricing_viewed                         │
│        └─ cta_clicked                            │
│                                                  │
│  ┌─ useAnalytics() hook ────────────────────┐    │
│  │  trackEvent(name, props)                 │    │
│  │  identifyUser(user)                      │    │
│  │  trackPageView()                         │    │
│  │  trackFunnelStep(funnel, step)           │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│       PostHog Cloud / EU         │
│                                  │
│  Dashboards:                     │
│  ├─ Tráfico diario               │
│  ├─ Fuentes de tráfico           │
│  ├─ Duración de sesión           │
│  ├─ Retención semanal            │
│  ├─ Flujos de navegación         │
│  ├─ Funnel de registro           │
│  └─ Session recordings           │
│                                  │
│  Admin Dashboard (interno):      │
│  └─ /dashboard → PostHog API     │
│     para métricas embebidas      │
└──────────────────────────────────┘
```

---

## Fases de implementación

### Fase 1: Setup base (prioridad alta)
**Objetivo**: Empezar a recopilar datos desde el día 1.

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| 1.1 | - | Crear cuenta en [PostHog Cloud](https://app.posthog.com/signup) (free tier) |
| 1.2 | `package.json` | `pnpm add posthog-js posthog-node` |
| 1.3 | `.env` | Agregar `NEXT_PUBLIC_POSTHOG_KEY` y `NEXT_PUBLIC_POSTHOG_HOST` |
| 1.4 | `src/lib/analytics.ts` | Módulo compartido de analytics (wrapper de PostHog) |
| 1.5 | `src/components/shared/PostHogProvider.tsx` | Provider client-side con autocapture |
| 1.6 | `src/app/layout.tsx` | Envolver app con `<PostHogProvider>` |
| 1.7 | `src/hooks/useAnalytics.ts` | Hook reutilizable `useAnalytics()` |

**Resultado**: autocapture de pageviews, clicks, duración de sesión, referrers, dispositivo y país.

### Fase 2: Eventos custom de conversión
**Objetivo**: Entender por qué no se registran.

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| 2.1 | `src/lib/analytics.ts` | Definir constantes de eventos (`ANALYTICS_EVENTS`) |
| 2.2 | `src/app/[locale]/register/page.tsx` | Trackear cada paso del registro |
| 2.3 | `src/app/[locale]/login/page.tsx` | Trackear login attempts, success, google_oauth |
| 2.4 | `src/components/PricingSection.tsx` | Trackear vistas de pricing y clicks en planes |
| 2.5 | `src/components/Hero.tsx`, `CTASection.tsx` | Trackear clicks en CTAs principales |
| 2.6 | `src/app/api/auth/google/route.ts` | Trackear servidor-side con `posthog-node` |

**Resultado**: Funnel completo de registro con drop-off analysis.

### Fase 3: Identificación de usuarios
**Objetivo**: Conectar visitantes anónimos con usuarios autenticados.

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| 3.1 | `src/app/[locale]/login/page.tsx` | `posthog.identify()` al hacer login exitoso |
| 3.2 | `src/app/api/auth/google/callback/route.ts` | Identify server-side en OAuth callback |
| 3.3 | `src/lib/analytics.ts` | Helper `identifyUser(user)` con propiedades: role, plan, company |

**Resultado**: Retención por usuario, análisis de comportamiento pre/post registro.

### Fase 4: Session recordings + Heatmaps
**Objetivo**: Ver exactamente qué hacen los usuarios y dónde se pierden.

| Tarea | Descripción |
|-------|-------------|
| 4.1 | Habilitar Session Recording en PostHog dashboard |
| 4.2 | Configurar sampling rate (ej: 50% en producción) |
| 4.3 | Habilitar heatmaps en PostHog toolbar |
| 4.4 | Crear playlist de recordings filtrados por "no se registró" |

**Resultado**: Videos reales de usuarios navegando. Heatmaps de clicks.

### Fase 5: Dashboards y métricas internas
**Objetivo**: Mostrar métricas en el admin dashboard de FashionsDen.

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| 5.1 | PostHog UI | Crear dashboards predefinidos para las 6 preguntas |
| 5.2 | `src/app/api/analytics/summary/route.ts` | API interna que consulta PostHog API |
| 5.3 | `src/components/dashboard/AnalyticsDashboard.tsx` | Widget de métricas en admin |
| 5.4 | - | Configurar alertas por email cuando el tráfico cae |

---

## Estructura de archivos propuesta

```
src/
├── lib/
│   └── analytics.ts              # Módulo compartido (client + server helpers)
├── hooks/
│   └── useAnalytics.ts           # Hook para componentes client
├── components/
│   └── shared/
│       └── PostHogProvider.tsx    # Provider con configuración
│   └── dashboard/
│       └── AnalyticsDashboard.tsx # Widget admin
└── app/
    └── api/
        └── analytics/
            └── summary/
                └── route.ts      # API para métricas internas
```

---

## Eventos custom a trackear

```typescript
// src/lib/analytics.ts
export const ANALYTICS_EVENTS = {
  // Registro
  REGISTRATION_PAGE_VIEWED: 'registration_page_viewed',
  REGISTRATION_ROLE_SELECTED: 'registration_role_selected',
  REGISTRATION_FORM_STARTED: 'registration_form_started',
  REGISTRATION_FORM_SUBMITTED: 'registration_form_submitted',
  REGISTRATION_SUCCESS: 'registration_success',
  REGISTRATION_ERROR: 'registration_error',
  REGISTRATION_ABANDONED: 'registration_abandoned',

  // Login
  LOGIN_PAGE_VIEWED: 'login_page_viewed',
  LOGIN_ATTEMPTED: 'login_attempted',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_ERROR: 'login_error',
  GOOGLE_OAUTH_CLICKED: 'google_oauth_clicked',
  GOOGLE_OAUTH_SUCCESS: 'google_oauth_success',

  // Navegación clave
  PRICING_VIEWED: 'pricing_viewed',
  PRICING_PLAN_CLICKED: 'pricing_plan_clicked',
  CTA_CLICKED: 'cta_clicked',
  HERO_CTA_CLICKED: 'hero_cta_clicked',

  // Engagement
  STRATEGY_CALL_CLICKED: 'strategy_call_clicked',
  CONTACT_FORM_SUBMITTED: 'contact_form_submitted',
} as const;
```

---

## Dashboards PostHog a crear

### Dashboard 1: Tráfico diario
- Gráfico de línea: visitantes únicos por día
- Tabla: top 10 páginas más visitadas
- Gráfico de barras: dispositivos (mobile vs desktop)

### Dashboard 2: Fuentes de tráfico
- Gráfico de torta: referrers (Google, directo, redes sociales)
- Tabla: UTM campaigns con conversiones
- Mapa: países de origen

### Dashboard 3: Tiempo de navegación
- Promedio de duración de sesión
- Promedio de páginas por sesión
- Distribución de duración (histograma)

### Dashboard 4: Retención
- Tabla de retención semanal/mensual
- Tasa de retorno (usuarios que vuelven en 7 días)
- Frecuencia de visitas por usuario

### Dashboard 5: Flujos de navegación
- Paths: trayectos más comunes
- Páginas de salida más frecuentes
- Páginas de entrada más comunes

### Dashboard 6: Funnel de registro
- Funnel: landing → register page → form started → form submitted → success
- Drop-off por paso
- Comparación: registro normal vs Google OAuth
- Session recordings de usuarios que abandonan

---

## Variables de entorno necesarias

```env
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxxxxxxxxx  # Para API server-side
```

---

## Estimación por fase

| Fase | Descripción | Complejidad |
|------|-------------|-------------|
| 1 | Setup base + autocapture | Baja |
| 2 | Eventos custom de conversión | Media |
| 3 | Identificación de usuarios | Baja |
| 4 | Session recordings + heatmaps | Baja (config en PostHog) |
| 5 | Dashboards + métricas internas | Media-Alta |

---

## Notas de sostenibilidad

- **Un solo módulo** (`src/lib/analytics.ts`) centraliza toda la lógica de tracking
- **Un solo hook** (`useAnalytics`) para uso en componentes
- **Eventos tipados** con constantes TypeScript para evitar typos
- **PostHog maneja todo**: no hay base de datos propia para analytics
- **Si se quiere migrar**: el wrapper abstrae PostHog, cambiar el provider no afecta los componentes
- **GDPR compliance**: PostHog tiene hosting EU y consent banner built-in
