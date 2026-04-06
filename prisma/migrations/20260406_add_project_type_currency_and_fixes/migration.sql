-- CreateTable and AddColumn for category fixes and new features

-- Add project_type to rfq_projects
ALTER TABLE rfq_projects
ADD COLUMN project_type VARCHAR(50) NULL AFTER code;

-- Add preferred_currency to users
ALTER TABLE users
ADD COLUMN preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD' AFTER avatar_url;

-- Update existing categories to match homepage
UPDATE subscription_plans SET slug = 'supplier_standard', name = 'Standard', price_usd = 0.00 WHERE id = 4;

UPDATE subscription_plans SET slug = 'supplier_pro', name = 'Pro', price_usd = 99.00 WHERE id = 5;

UPDATE subscription_plans SET slug = 'supplier_elite', name = 'Elite', price_usd = 599.00 WHERE id = 6;
