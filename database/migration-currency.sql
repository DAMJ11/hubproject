-- ============================================================
-- MIGRATION: Add preferred_currency to users table
-- Run: mysql -u root -p hubproject < database/migration-currency.sql
-- ============================================================

ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD' AFTER avatar_url;
