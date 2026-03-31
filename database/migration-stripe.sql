-- =============================================
-- Migración: Agregar campos Stripe
-- Fecha: 2026-03-30
-- Descripción: Agrega campos para integración con Stripe
-- =============================================

-- 1. Agregar stripe_customer_id a users
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255) NULL UNIQUE AFTER email_verified_at;

-- 2. Agregar stripe_price_id a subscription_plans
ALTER TABLE subscription_plans ADD COLUMN stripe_price_id VARCHAR(255) NULL AFTER dedicated_support;

-- 3. Agregar stripe_subscription_id a subscriptions
ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id VARCHAR(255) NULL UNIQUE AFTER status;

-- 4. Agregar stripe_invoice_id a subscription_invoices
ALTER TABLE subscription_invoices ADD COLUMN stripe_invoice_id VARCHAR(255) NULL AFTER subscription_id;

-- 5. Agregar stripe_payment_method_id a user_payment_methods
ALTER TABLE user_payment_methods ADD COLUMN stripe_payment_method_id VARCHAR(255) NULL AFTER user_id;

-- 6. Índices para búsqueda por IDs de Stripe
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_invoices_stripe ON subscription_invoices(stripe_invoice_id);
