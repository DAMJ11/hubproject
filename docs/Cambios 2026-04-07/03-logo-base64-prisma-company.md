# 03 - Persistencia logo/caratula en Base64 + Prisma

## Ruta tecnica
- Prisma model: `prisma/schema.prisma`
- SQL migracion: `prisma/migrations/20260407093000_company_brand_profile_fields/migration.sql`
- API update: `/api/companies`

## Objetivo
- Guardar logo del brand en formato Base64 en base de datos.

## Cambios aplicados
- `logo_url` se actualizo a `MEDIUMTEXT` para soportar base64.
- Se agregaron columnas de perfil publico:
  - `cover_image_url` (MEDIUMTEXT)
  - `instagram_handle`
  - `brand_categories`
  - `brand_tagline`
  - `ships_worldwide`
- En formulario se agrego conversion a base64 antes de guardar (`FileReader` DataURL).

## Como validar el cambio
1. Subir un logo en `/dashboard/company`.
2. Guardar perfil.
3. Confirmar en DB que `companies.logo_url` contiene cadena base64.
4. Recargar la pagina y verificar preview persistido.
