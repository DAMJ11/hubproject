-- ============================================================
-- MIGRATION: Update service_categories to match homepage cards
-- Run: mysql -u root -p hubproject < database/migration-categories.sql
-- ============================================================

-- Update existing categories to match homepage cards
UPDATE service_categories SET name='Design',    slug='design',     description='Concepts, sketches and creative direction',   icon='PenLine',  sort_order=1 WHERE id=1;
UPDATE service_categories SET name='Tech Pack', slug='tech-pack',  description='Technical specifications for production',     icon='FileText', sort_order=2 WHERE id=2;
UPDATE service_categories SET name='Sourcing',  slug='sourcing',   description='Materials, trims and supplier matching',      icon='Search',   sort_order=3 WHERE id=3;
UPDATE service_categories SET name='Sampling',  slug='sampling',   description='Prototype development and revisions',         icon='Scissors', sort_order=4 WHERE id=4;
UPDATE service_categories SET name='Production',slug='production', description='Manufacturing with trusted partners',         icon='Cog',      sort_order=5 WHERE id=5;
UPDATE service_categories SET name='Branding',  slug='branding',   description='Content, visuals and brand support',          icon='Sparkles', sort_order=6 WHERE id=6;

-- Deactivate any old categories that no longer match
UPDATE service_categories SET is_active = FALSE WHERE id > 6;
