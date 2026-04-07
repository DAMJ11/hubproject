# 01 - Fix critico: Maximum update depth en setup de tarjeta

## Ruta de la pagina
- /dashboard/setup-payment

## Problema detectado
- Al volver de Stripe con `?success=true`, el componente entraba en ciclo de re-render.
- Resultado: error `Maximum update depth exceeded` al agregar tarjeta como manufacturer.

## Como se implemento
- Archivo: `src/app/[locale]/dashboard/setup-payment/page.tsx`
- Se controlo el efecto de exito para que se procese una sola vez (guardia con `useRef`).
- Se evito reescribir `setUser` innecesariamente cuando `hasPaymentMethod` ya era true.

## Como validar el cambio
1. Entrar como manufacturer.
2. Agregar tarjeta de prueba en Stripe.
3. Volver a `/dashboard/setup-payment?success=true`.
4. Verificar que no aparece el error y redirige a dashboard.
