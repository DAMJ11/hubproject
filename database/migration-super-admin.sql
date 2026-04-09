-- Migration: Add super_admin role to users table
-- Date: 2026-04-09

-- Add super_admin to the role enum
ALTER TABLE users MODIFY COLUMN role ENUM('brand','manufacturer','admin','super_admin') NOT NULL DEFAULT 'brand';

-- Promote CEO account to super_admin
UPDATE users SET role = 'super_admin' WHERE email = 'ceo@hubbgroup.mx';
