# 02 - Rediseño de My Company (Imagen 1 -> Imagen 2)

## Ruta de la pagina
- /dashboard/company

## Objetivo
- Pasar el formulario actual al estilo de perfil publico de marca (segun imagen de referencia).
- Mantener identidad visual del proyecto, sin copiar colores exactos de la simulacion.

## Cambios aplicados
- Archivo: `src/app/[locale]/dashboard/company/company-form.tsx`
- Se reestructuro el formulario a layout de perfil publico con preview.
- Se retiraron campos subrayados: Address, City, State/Province, Employees.
- Se agregaron secciones de:
  - logo de marca
  - cover image
  - bio/tagline
  - categorias de marca
  - instagram
  - preview de perfil

## Como validar el cambio
1. Abrir `/dashboard/company`.
2. Confirmar que ya no aparecen Address, City, State/Province, Employees.
3. Confirmar que la vista corresponde al nuevo diseño de perfil (estructura de imagen 2).
