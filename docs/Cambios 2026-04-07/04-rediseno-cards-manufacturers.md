# 04 - Rediseño cards de perfiles de empresa (manufacturers)

## Ruta de la pagina
- /dashboard/manufacturers

## Objetivo
- Adaptar la vista de perfiles para mobile-first y luego desktop, mostrando informacion clave.

## Cambios aplicados
- Archivo UI: `src/app/[locale]/dashboard/manufacturers/manufacturers-list.tsx`
- Archivo API: `src/app/api/manufacturers/route.ts`
- Se incorporo en card:
  - tipo de servicio (solo diseño, solo produccion, diseño + produccion)
  - categorias visuales (max 4, colores diferenciados)
  - MOQ minimo
  - indicador de envios worldwide
- Se simplifico la card priorizando lectura rapida y datos comerciales.

## Como validar el cambio
1. Ir a `/dashboard/manufacturers` en mobile.
2. Confirmar visual de categorias max 4 y badges de modo/MOQ/envios.
3. Revisar desktop y validar adaptacion responsiva.
