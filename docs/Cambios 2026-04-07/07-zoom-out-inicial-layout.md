# 07 - Zoom out inicial al cargar

## Ruta tecnica
- `src/app/[locale]/layout.tsx`

## Objetivo
- Aplicar zoom out inicial al comenzar para mejorar encuadre visual en mobile.

## Cambios aplicados
- Se definio `viewport` con `initialScale` menor a 1 para carga inicial.
- Se mantuvo compatibilidad de render en desktop.

## Como validar el cambio
1. Abrir cualquier ruta dashboard en celular.
2. Confirmar que la vista inicial arranca con zoom out.
3. Validar que no rompe layout ni legibilidad.
