-- ============================================================
-- SEED DATA — TidyHubb / Manufy-Clone
-- Datos de prueba para testeo post-deploy
-- Ejecutar: mysql -u root -p hubproject < database/seed.sql
-- ============================================================

-- Contraseña para todos los usuarios de prueba: "Test1234!"
-- Hash bcrypt (12 rounds) de "Test1234!"
SET @pwd = '$2a$12$LJ3TJqPQlbTTFQUzFkJZZONjXlVkLQoIvwUG8Jd5eFXGxq3c9eAq2';

-- ── Categorías de servicio ──────────────────────────────────

INSERT IGNORE INTO service_categories (id, name, slug, description, is_active, sort_order) VALUES
(1, 'Confección de ropa',    'confeccion-ropa',    'Fabricación de prendas de vestir', TRUE, 1),
(2, 'Tejido de punto',       'tejido-punto',       'Producción de telas de punto',     TRUE, 2),
(3, 'Estampado textil',      'estampado-textil',   'Servicios de estampado y sublimación', TRUE, 3),
(4, 'Bordado industrial',    'bordado-industrial', 'Bordado a escala industrial',      TRUE, 4),
(5, 'Corte y patronaje',     'corte-patronaje',    'Servicios de corte y diseño de patrones', TRUE, 5);

-- ── Empresa marca (brand) ───────────────────────────────────

INSERT IGNORE INTO companies (id, name, slug, type, email, description, city, country, is_active, is_verified, created_at, updated_at) VALUES
(1, 'EcoWear Colombia', 'ecowear-colombia', 'brand', 'brand@test.com',
 'Marca de moda sostenible colombiana', 'Bogotá', 'Colombia', TRUE, TRUE, NOW(), NOW());

-- ── Empresa fabricante (manufacturer) ───────────────────────

INSERT IGNORE INTO companies (id, name, slug, type, email, description, city, country, latitude, longitude, is_active, is_verified, created_at, updated_at) VALUES
(2, 'Textiles Verdes SAS', 'textiles-verdes-sas', 'manufacturer', 'manufacturer@test.com',
 'Fabricante textil con certificaciones sostenibles', 'Medellín', 'Colombia',
 6.2442, -75.5812, TRUE, TRUE, NOW(), NOW());

-- ── Usuario marca ───────────────────────────────────────────

INSERT IGNORE INTO users (id, email, password, first_name, last_name, role, company_id, terms_accepted, is_active, created_at, updated_at) VALUES
(1, 'brand@test.com', @pwd, 'Carlos', 'Marca', 'brand', 1, TRUE, TRUE, NOW(), NOW());

-- ── Usuario fabricante ──────────────────────────────────────

INSERT IGNORE INTO users (id, email, password, first_name, last_name, role, company_id, terms_accepted, is_active, created_at, updated_at) VALUES
(2, 'manufacturer@test.com', @pwd, 'Ana', 'Fabricante', 'manufacturer', 2, TRUE, TRUE, NOW(), NOW());

-- ── Usuario admin ───────────────────────────────────────────

INSERT IGNORE INTO users (id, email, password, first_name, last_name, role, company_id, terms_accepted, is_active, created_at, updated_at) VALUES
(3, 'admin@test.com', @pwd, 'Admin', 'Sistema', 'admin', NULL, TRUE, TRUE, NOW(), NOW());

-- ── Capacidades del fabricante ──────────────────────────────

INSERT IGNORE INTO manufacturer_capabilities (company_id, category_id, min_order_qty, max_monthly_capacity, lead_time_days, description, is_active) VALUES
(2, 1, 100, 5000, 30, 'Confección completa de prendas con materiales orgánicos', TRUE),
(2, 3, 50,  3000, 15, 'Estampado por sublimación y serigrafía eco-friendly', TRUE);

-- ── Certificaciones del fabricante ──────────────────────────

INSERT IGNORE INTO manufacturer_certifications (company_id, name, issued_by, is_verified, issued_at) VALUES
(2, 'GOTS',     'Global Organic Textile Standard', TRUE, '2025-01-15'),
(2, 'OEKO-TEX', 'OEKO-TEX Association',            TRUE, '2025-03-01');

-- ── RFQ de ejemplo ──────────────────────────────────────────

INSERT IGNORE INTO rfq_projects (id, code, brand_company_id, created_by_user_id, category_id, title, description, quantity, budget_min, budget_max, deadline, proposals_deadline, status, requires_sample, sustainability_priority, created_at, updated_at) VALUES
(1, 'RFQ-2026-001', 1, 1, 1,
 'Producción de camisetas orgánicas',
 'Necesitamos 500 camisetas de algodón orgánico certificado GOTS para nuestra nueva colección de primavera. Tallas S, M, L, XL. Colores: blanco, verde, azul.',
 500, 15000000, 25000000, '2026-06-01', '2026-04-15', 'open', TRUE, TRUE, NOW(), NOW());

-- ── Materiales del RFQ ──────────────────────────────────────

INSERT IGNORE INTO rfq_materials (rfq_id, material_type, composition, recycled_percentage, specifications) VALUES
(1, 'Algodón orgánico', '100% algodón orgánico certificado', 0, 'Gramaje: 180g/m², pre-encogido'),
(1, 'Tinta eco',        'Tintas base agua',                  100, 'Sin PVC, sin ftalatos');

-- ============================================================
-- Usuarios de prueba:
--   brand@test.com       / Test1234!   (rol: brand)
--   manufacturer@test.com / Test1234!  (rol: manufacturer)
--   admin@test.com        / Test1234!  (rol: admin)
-- ============================================================
