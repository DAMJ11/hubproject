# 10 - Fix fallback de metodo de pago para manufacturer

## Ruta de la pagina
- Middleware de sesion dashboard via /api/auth/me
- Flujo bloqueado: /dashboard/setup-payment

## Problema detectado
- En algunos casos Stripe ya tenia tarjeta configurada, pero la tabla local `user_payment_methods` no tenia registro sincronizado.
- Resultado: el sistema seguia enviando al usuario a setup-payment como si no tuviera metodo de pago.

## Como se implemento
- Archivo: `src/app/api/auth/me/route.ts`
- Logica nueva:
  - Primero revisa `user_payment_methods` (flujo original).
  - Si no hay registros y existe `stripe_customer_id`, consulta Stripe (`paymentMethods.list`).
  - Si Stripe devuelve al menos una tarjeta, responde `hasPaymentMethod = true`.

## Como validar el cambio
1. Usuario manufacturer con `stripe_customer_id` y tarjeta guardada en Stripe.
2. Simular ausencia de filas en `user_payment_methods`.
3. Llamar `/api/auth/me` y verificar `hasPaymentMethod: true`.
4. Confirmar que ya no redirige nuevamente a `/dashboard/setup-payment`.
