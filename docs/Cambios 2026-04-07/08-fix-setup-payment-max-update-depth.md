# 08 - Fix Setup Payment (Maximum update depth)

## Ruta de la pagina
- /dashboard/setup-payment

## Problema detectado
- React entraba en un ciclo infinito de renders al procesar `success=true` despues de volver de Stripe.
- El efecto llamaba `setUser(...)` y tenia `user` en dependencias, por lo que se ejecutaba repetidamente.

## Como se implemento
- Archivo: `src/app/[locale]/dashboard/setup-payment/page.tsx`
- Se agrego una guarda con `useRef` (`hasProcessedSuccess`) para ejecutar el efecto de exito una sola vez.
- Se evita reescribir `setUser` si `hasPaymentMethod` ya es `true`.
- Se mantiene redireccion a `/dashboard` tras 3 segundos.

## Como validar el cambio
1. Completar setup de tarjeta en Stripe.
2. Regresar a `/dashboard/setup-payment?success=true`.
3. Confirmar que no aparece el error de `Maximum update depth exceeded`.
4. Confirmar redireccion automatica a `/dashboard`.
