# Plan de Acción: Editor de Textos desde Panel Admin

## Objetivo
Permitir que un administrador edite textos del sitio (ES/EN/FR) desde la aplicación, sin tocar código ni hacer deploy para cada cambio.

## Principio de diseño
Implementar un modelo híbrido:

- Fuente base: archivos `messages/*.json` (fallback estable).
- Overrides dinámicos: base de datos (editable desde admin).
- Prioridad de lectura: `DB override > JSON base`.

Con este enfoque, si la DB falla, el sitio sigue funcionando con los JSON.

## Alcance (MVP)

1. Editar textos por clave (`key`) e idioma (`es`, `en`, `fr`).
2. Guardar en borrador y publicar.
3. Historial de cambios (auditoría).
4. Aplicación inmediata en frontend al publicar.
5. Control de permisos por rol admin.

---

## Arquitectura propuesta

## 1) Modelo de datos

### Tabla: `i18n_keys`
Catálogo de claves de traducción.

Campos sugeridos:
- `id` (PK)
- `key_path` (UNIQUE) — ejemplo: `Pricing.supplierPlans.0.desc`
- `module` — ejemplo: `Pricing`, `Dashboard`, `Settings`
- `description` (nullable)
- `is_active` (bool)
- `created_at`, `updated_at`

### Tabla: `i18n_values`
Valor por idioma y versión.

Campos sugeridos:
- `id` (PK)
- `key_id` (FK -> i18n_keys)
- `locale` (`es|en|fr`)
- `value_text` (TEXT)
- `status` (`draft|published|archived`)
- `version` (int)
- `created_by_user_id` (FK users)
- `published_by_user_id` (nullable FK users)
- `published_at` (nullable)
- `created_at`, `updated_at`

Índices:
- UNIQUE (`key_id`, `locale`, `version`)
- INDEX (`locale`, `status`)
- INDEX (`published_at`)

### Tabla: `i18n_audit_logs`
Trazabilidad completa de cambios.

Campos sugeridos:
- `id` (PK)
- `key_path`
- `locale`
- `old_value` (TEXT)
- `new_value` (TEXT)
- `action` (`create|update|publish|rollback`)
- `changed_by_user_id`
- `created_at`

---

## 2) Flujo de lectura en runtime

En `src/i18n/request.ts`:

1. Cargar mensajes base desde `messages/{locale}.json`.
2. Consultar overrides publicados para `locale`.
3. Convertir `key_path` a estructura nested.
4. Hacer merge profundo con prioridad a DB.
5. Retornar objeto final a `next-intl`.

Recomendación de performance:
- Cache por locale (TTL corto o invalidación por publish).
- Invalidar cache cuando se publique una traducción.

---

## 3) APIs backend (App Router)

### `GET /api/admin/i18n/keys`
- Lista claves con búsqueda/filtros por módulo.

### `GET /api/admin/i18n/values?key=...`
- Devuelve valores por idioma y estado.

### `POST /api/admin/i18n/values`
- Crea/actualiza borrador para un idioma.

### `POST /api/admin/i18n/publish`
- Publica draft y crea nueva versión published.
- Registra auditoría.
- Dispara invalidación de cache/tag.

### `POST /api/admin/i18n/rollback`
- Revierte a versión previa publicada.
- Registra auditoría.

Seguridad:
- Todas las rutas requieren sesión + rol `admin`.
- Validaciones de longitud, placeholders y contenido.

---

## 4) UI Admin (Dashboard)

Nueva sección: `Admin > Content > Translations`

Pantalla sugerida:

- Barra de búsqueda por key (`Pricing.`, `Settings.`, etc.)
- Filtro por módulo
- Lista de claves
- Panel derecho con tabs por idioma (`es`, `en`, `fr`)
- Estado de cada idioma: draft/published
- Botones: `Guardar borrador`, `Publicar`, `Ver historial`, `Rollback`
- Preview opcional (fase 2)

---

## 5) Reglas de calidad y sostenibilidad

1. No permitir borrar claves base del sistema desde UI.
2. Proteger placeholders obligatorios (ej. `{name}`, `{count}`).
3. Definir límites de longitud por tipo de texto.
4. Evitar HTML libre en MVP (solo texto plano).
5. Registrar siempre usuario y timestamp en cada cambio.
6. Fallback automático a JSON si no hay override.

---

## 6) Plan por fases

## Fase 1 (MVP - 3 a 5 días)
- Tablas `i18n_keys`, `i18n_values`, `i18n_audit_logs`.
- Carga híbrida JSON + DB en `request.ts`.
- APIs básicas (`keys`, `values`, `save draft`, `publish`).
- UI básica para editar/publicar.
- Permisos admin.

## Fase 2 (Robustez - 2 a 4 días)
- Historial detallado + rollback.
- Validación fuerte de placeholders.
- Cache por locale + invalidación al publicar.
- Filtros avanzados por módulo/página.

## Fase 3 (Escala - 3 a 6 días)
- Preview por página antes de publicar.
- Flujo de aprobación (editor -> aprobador).
- Export/import controlado para traducción externa.
- Métricas de cobertura de traducciones por módulo.

---

## 7) Riesgos y mitigación

- Riesgo: texto roto por cambio manual.
  - Mitigación: draft + publish + validaciones + rollback.

- Riesgo: impacto de performance por consultas runtime.
  - Mitigación: cache por locale y query de solo published.

- Riesgo: inconsistencias entre idiomas.
  - Mitigación: estado por idioma y vista comparativa ES/EN/FR.

---

## 8) Criterios de éxito

1. Un admin puede editar un texto y publicarlo sin deploy.
2. Cambio visible en menos de 1 minuto.
3. Se conserva historial completo y rollback funcional.
4. Si DB falla, el sitio sigue mostrando textos base del JSON.

---

## 9) Decisión recomendada

Sí, es totalmente viable permitir edición desde admin.
La opción más sostenible en este proyecto es:

- Mantener `messages/*.json` como base.
- Gestionar overrides y publicación en DB.
- Integrar merge en runtime dentro de `src/i18n/request.ts`.

Esto evita dependencia de cambios en repositorio para textos operativos y mantiene seguridad, trazabilidad y estabilidad.