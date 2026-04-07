# 09 - Fix compatibilidad de columnas en companies

## Ruta de la pagina
- /dashboard/company
- API: /api/companies/me

## Problema detectado
- Error SQL: `Unknown column 'cover_image_url' in 'field list'`.
- Ocurria cuando el codigo ya consultaba columnas nuevas pero la base de datos aun no tenia aplicada la migracion.

## Como se implemento
- Archivo: `src/lib/db.ts`
  - Se agrego `getTableColumns(table)` para leer columnas reales desde `INFORMATION_SCHEMA.COLUMNS`.
- Archivo: `src/lib/data/companies.ts`
  - Se agrego `getCompanyById(companyId)` que arma el `SELECT` solo con columnas disponibles.
  - `getCurrentCompany()` usa este helper para evitar fallos por schema drift.
- Archivo: `src/app/api/companies/me/route.ts`
  - Reutiliza `getCompanyById` en vez de `SELECT` fijo.
- Archivo: `src/app/api/companies/route.ts`
  - El `PUT` filtra campos por columnas existentes antes de ejecutar `UPDATE`.

## Como validar el cambio
1. Entrar a `/dashboard/company` con una DB sin migracion de columnas nuevas.
2. Confirmar que la pagina carga sin error SQL.
3. Actualizar campos disponibles y confirmar que el guardado responde `success: true`.
