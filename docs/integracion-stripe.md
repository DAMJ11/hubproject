# Integración Stripe — FashionHubb

> Fecha: 2026-03-30
> Estado: Completo (backend + frontend + BD)

## Resumen

Stripe gestiona los pagos de suscripción de la plataforma. Los usuarios no crean cuenta en Stripe; la plataforma crea un "Customer" internamente cuando el usuario elige un plan de pago.

---

## Arquitectura

```
Usuario elige plan → POST /api/subscriptions
  ├─ Plan gratis → se activa directo en BD
  └─ Plan pago  → retorna { requires_checkout: true }
                    ↓
                    Frontend llama POST /api/stripe/checkout
                    ↓
                    Redirige a Stripe Checkout (hosted page)
                    ↓
                    Stripe completa → redirect a /dashboard/settings?subscription=success
                    ↓
                    Webhook /api/stripe/webhook confirma pago y actualiza BD
```

---

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/subscriptions` | Lista planes y suscripción actual del usuario |
| POST | `/api/subscriptions` | Activa plan gratis o redirige a checkout para pagos |
| POST | `/api/stripe/checkout` | Crea Stripe Checkout Session (suscripción con trial 7 días) |
| POST | `/api/stripe/portal` | Abre el Stripe Customer Portal (gestionar tarjeta/facturas) |
| POST | `/api/stripe/webhook` | Recibe eventos de Stripe y sincroniza BD local |
| POST | `/api/subscriptions/cancel` | Cancela suscripción (activa hasta fin de periodo) |

---

## Columnas añadidas a la BD (migration-stripe.sql)

| Tabla | Columna | Propósito |
|-------|---------|-----------|
| `users` | `stripe_customer_id` | Vincula user ↔ Stripe Customer (NULL hasta que pague) |
| `subscription_plans` | `stripe_price_id` | Vincula plan local con Stripe Price ID |
| `subscriptions` | `stripe_subscription_id` | Vincula suscripción local con Stripe Subscription |
| `subscription_invoices` | `stripe_invoice_id` | Vincula factura local con Stripe Invoice |
| `user_payment_methods` | `stripe_payment_method_id` | Vincula método de pago con Stripe PaymentMethod |

---

## Variables de entorno (.env)

```env
# Claves de API
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (configurar al desplegar)

# Price IDs (creados en dashboard.stripe.com → Products)
STRIPE_PRICE_BRAND_STARTER=price_...
STRIPE_PRICE_BRAND_SCALE=price_...
STRIPE_PRICE_BRAND_ENTERPRISE=price_...
STRIPE_PRICE_SUPPLIER_PRO=price_...
STRIPE_PRICE_SUPPLIER_ELITE=price_...
```

> **supplier_standard** es gratis, no tiene Price ID.

---

## Planes configurados

| Slug | Precio | Stripe Price ID |
|------|--------|----------------|
| brand_starter | $29/mes | STRIPE_PRICE_BRAND_STARTER |
| brand_scale | $149/mes | STRIPE_PRICE_BRAND_SCALE |
| brand_enterprise | $499/mes | STRIPE_PRICE_BRAND_ENTERPRISE |
| supplier_standard | Gratis | — (sin Stripe) |
| supplier_pro | $99/mes | STRIPE_PRICE_SUPPLIER_PRO |
| supplier_elite | $599/mes | STRIPE_PRICE_SUPPLIER_ELITE |

---

## Eventos Webhook manejados

| Evento | Acción |
|--------|--------|
| `checkout.session.completed` | Crea suscripción local, actualiza estado a "active" o "trial" |
| `customer.subscription.updated` | Sincroniza cambios de plan, estado y periodo |
| `customer.subscription.deleted` | Marca suscripción como "cancelled" |
| `invoice.paid` | Registra factura en subscription_invoices, guarda método de pago |
| `invoice.payment_failed` | Marca suscripción como "past_due" |

---

## Frontend integrado

- **Settings → tab "Suscripción"**: Muestra plan actual, estado, fecha de renovación, botones de gestión
- **Flujo checkout**: Desde settings, el usuario elige plan → redirige a Stripe → regresa con `?subscription=success`
- **Portal de billing**: Botón "Gestionar facturación" abre Stripe Customer Portal
- **Cancelación**: Botón cancela suscripción (permanece activa hasta fin del periodo)

---

## Flujo de datos (SDK v21)

> **Importante**: Stripe SDK v21 tiene breaking changes:
> - `current_period_start/end` están en `subscription.items.data[0]`, no en `subscription` raíz
> - `invoice.subscription` se movió a `invoice.parent.subscription_details.subscription`
> - El cliente Stripe usa patrón lazy Proxy para evitar errores en build time

---

## Pendiente para producción

1. **Configurar Webhook Secret**: En Stripe Dashboard → Webhooks → agregar endpoint con la URL de Railway → copiar `whsec_...` al `.env`
2. **Cambiar a claves live**: Reemplazar `sk_test_` y `pk_test_` por claves de producción
3. **Configurar Customer Portal**: En Stripe Dashboard → Settings → Customer portal → habilitar opciones deseadas
