# 05 - Reemplazo de Tax ID por Brand Name

## Ruta de la pagina
- /dashboard/company

## Objetivo
- Quitar el enfoque en Tax ID y usar Brand Name como campo principal.

## Cambios aplicados
- Archivo: `src/app/[locale]/dashboard/company/company-form.tsx`
- Se removio el bloque visual priorizado de Tax ID.
- El campo principal del formulario queda como `Brand Name`.

## Como validar el cambio
1. Abrir `/dashboard/company`.
2. Verificar que Tax ID no esta como campo protagonista del formulario.
3. Confirmar que Brand Name aparece como primer campo principal.
