-- =============================================
-- HUBPROJECT Final Schema (Post B2B Migrations)
-- Source of truth: migration_marketplace_b2b.sql + migration_cleanup_b2b.sql
-- =============================================

CREATE DATABASE IF NOT EXISTS hubproject
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE hubproject;

-- Rebuild full schema to ensure removed legacy tables are not left behind.
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS contract_milestones;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS proposals;
DROP TABLE IF EXISTS rfq_attachments;
DROP TABLE IF EXISTS rfq_materials;
DROP TABLE IF EXISTS rfq_projects;
DROP TABLE IF EXISTS manufacturer_certifications;
DROP TABLE IF EXISTS manufacturer_capabilities;
DROP TABLE IF EXISTS promo_codes;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS professional_availability;
DROP TABLE IF EXISTS professional_services;
DROP TABLE IF EXISTS professionals;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS service_categories;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 1. service_categories
-- =============================================
CREATE TABLE service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NULL,
    icon VARCHAR(50) NULL,
    image_url VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. companies
-- =============================================
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    type ENUM('brand', 'manufacturer') NOT NULL,
    legal_id VARCHAR(50) NULL,
    description TEXT NULL,
    logo_url VARCHAR(500) NULL,
    website VARCHAR(500) NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    address_line1 VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    employee_count ENUM('1-10', '11-50', '51-200', '201-500', '500+') NULL,
    founded_year SMALLINT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_companies_slug (slug),
    INDEX idx_companies_type (type),
    INDEX idx_companies_active (is_active),
    INDEX idx_companies_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. users
-- =============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NULL,
    avatar_url VARCHAR(500) NULL,
    role ENUM('brand', 'manufacturer', 'admin') NOT NULL DEFAULT 'brand',
    company_id INT NULL,
    terms_accepted BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_company (company_id),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. addresses (kept as optional table from cleanup migration)
-- =============================================
CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    label VARCHAR(100) NOT NULL DEFAULT 'Oficina',
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. manufacturer_capabilities
-- =============================================
CREATE TABLE manufacturer_capabilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    category_id INT NOT NULL,
    min_order_qty INT DEFAULT 1,
    max_monthly_capacity INT NULL,
    lead_time_days INT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
    UNIQUE KEY uk_company_category (company_id, category_id),
    INDEX idx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. manufacturer_certifications
-- =============================================
CREATE TABLE manufacturer_certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    issued_by VARCHAR(200) NULL,
    certificate_url VARCHAR(500) NULL,
    issued_at DATE NULL,
    expires_at DATE NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company (company_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. rfq_projects
-- =============================================
CREATE TABLE rfq_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    brand_company_id INT NOT NULL,
    created_by_user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL,
    budget_min DECIMAL(12, 2) NULL,
    budget_max DECIMAL(12, 2) NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    deadline DATE NULL,
    proposals_deadline DATE NULL,
    status ENUM('draft', 'open', 'evaluating', 'awarded', 'cancelled', 'expired') NOT NULL DEFAULT 'draft',
    requires_sample BOOLEAN DEFAULT FALSE,
    preferred_materials TEXT NULL,
    sustainability_priority BOOLEAN DEFAULT FALSE,
    proposals_count INT DEFAULT 0,
    awarded_proposal_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT,
    INDEX idx_code (code),
    INDEX idx_brand (brand_company_id),
    INDEX idx_status (status),
    INDEX idx_category (category_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. rfq_materials
-- =============================================
CREATE TABLE rfq_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfq_id INT NOT NULL,
    material_type VARCHAR(100) NOT NULL,
    composition VARCHAR(255) NULL,
    recycled_percentage TINYINT DEFAULT 0,
    specifications TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rfq_id) REFERENCES rfq_projects(id) ON DELETE CASCADE,
    INDEX idx_rfq (rfq_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. rfq_attachments
-- =============================================
CREATE TABLE rfq_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfq_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NULL,
    file_size INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rfq_id) REFERENCES rfq_projects(id) ON DELETE CASCADE,
    INDEX idx_rfq (rfq_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. proposals
-- =============================================
CREATE TABLE proposals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfq_id INT NOT NULL,
    manufacturer_company_id INT NOT NULL,
    submitted_by_user_id INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    lead_time_days INT NOT NULL,
    proposed_materials TEXT NULL,
    recycled_percentage TINYINT DEFAULT 0,
    notes TEXT NULL,
    status ENUM('submitted', 'shortlisted', 'accepted', 'rejected', 'withdrawn') NOT NULL DEFAULT 'submitted',
    green_score DECIMAL(5, 2) DEFAULT 0.00,
    distance_km DECIMAL(8, 2) NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rfq_id) REFERENCES rfq_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (manufacturer_company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    FOREIGN KEY (submitted_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_rfq_manufacturer (rfq_id, manufacturer_company_id),
    INDEX idx_rfq (rfq_id),
    INDEX idx_manufacturer (manufacturer_company_id),
    INDEX idx_status (status),
    INDEX idx_green_score (green_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE rfq_projects
    ADD CONSTRAINT fk_rfq_awarded_proposal FOREIGN KEY (awarded_proposal_id) REFERENCES proposals(id) ON DELETE SET NULL;

-- =============================================
-- 11. contracts
-- =============================================
CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    rfq_id INT NOT NULL,
    proposal_id INT NOT NULL,
    brand_company_id INT NOT NULL,
    manufacturer_company_id INT NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    status ENUM('active', 'in_production', 'completed', 'disputed', 'cancelled') NOT NULL DEFAULT 'active',
    terms TEXT NULL,
    start_date DATE NULL,
    expected_end_date DATE NULL,
    actual_end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rfq_id) REFERENCES rfq_projects(id) ON DELETE RESTRICT,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE RESTRICT,
    FOREIGN KEY (brand_company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    FOREIGN KEY (manufacturer_company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    INDEX idx_code (code),
    INDEX idx_brand (brand_company_id),
    INDEX idx_manufacturer (manufacturer_company_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 12. contract_milestones
-- =============================================
CREATE TABLE contract_milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    sort_order TINYINT NOT NULL DEFAULT 0,
    status ENUM('pending', 'in_progress', 'completed', 'skipped') NOT NULL DEFAULT 'pending',
    payment_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_status ENUM('pending', 'paid', 'na') DEFAULT 'pending',
    due_date DATE NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    INDEX idx_contract (contract_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 13. conversations (B2B only)
-- =============================================
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfq_id INT NULL,
    contract_id INT NULL,
    brand_company_id INT NULL,
    manufacturer_company_id INT NULL,
    target_company_id INT NULL,
    admin_user_id INT NULL,
    initiated_by_user_id INT NOT NULL,
    subject VARCHAR(255) NULL,
    status ENUM('pending', 'open', 'closed', 'archived') DEFAULT 'pending',
    last_message_at TIMESTAMP NULL,
    accepted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rfq_id) REFERENCES rfq_projects(id) ON DELETE SET NULL,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (manufacturer_company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (target_company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (initiated_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_brand (brand_company_id),
    INDEX idx_manufacturer (manufacturer_company_id),
    INDEX idx_target_company (target_company_id),
    INDEX idx_admin_user (admin_user_id),
    INDEX idx_rfq (rfq_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 14. messages (B2B only)
-- =============================================
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_user_id INT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    file_url VARCHAR(500) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (conversation_id),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 15. reviews (B2B only)
-- =============================================
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    reviewer_company_id INT NOT NULL,
    reviewed_company_id INT NOT NULL,
    reviewer_user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_contract_reviewer (contract_id, reviewer_company_id),
    INDEX idx_reviewed (reviewed_company_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 16. payments (B2B only)
-- =============================================
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    milestone_id INT NULL,
    payer_company_id INT NOT NULL,
    payee_company_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    payment_method ENUM('transfer', 'card', 'nequi', 'daviplata', 'other') NOT NULL DEFAULT 'transfer',
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255) NULL,
    payment_gateway VARCHAR(50) NULL,
    paid_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE RESTRICT,
    FOREIGN KEY (milestone_id) REFERENCES contract_milestones(id) ON DELETE SET NULL,
    FOREIGN KEY (payer_company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    FOREIGN KEY (payee_company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    INDEX idx_contract (contract_id),
    INDEX idx_status (status),
    INDEX idx_payer (payer_company_id),
    INDEX idx_payee (payee_company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 17. notifications (cleanup enum)
-- =============================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('message', 'payment', 'review', 'system', 'rfq', 'proposal', 'contract') NOT NULL,
    reference_type VARCHAR(50) NULL,
    reference_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 18. subscription_plans
-- =============================================
CREATE TABLE subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug ENUM('brand_starter','brand_scale','brand_enterprise','supplier_standard','supplier_pro','supplier_elite') NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    target_role ENUM('brand', 'manufacturer', 'admin') NOT NULL,
    price_usd DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    max_active_projects INT NOT NULL DEFAULT -1,
    priority_matching BOOLEAN DEFAULT FALSE,
    verified_badge BOOLEAN DEFAULT FALSE,
    production_tracking BOOLEAN DEFAULT FALSE,
    dedicated_support BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_target_role (target_role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 19. subscriptions
-- =============================================
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    status ENUM('trial','active','cancelled','expired','past_due') NOT NULL DEFAULT 'trial',
    trial_ends_at TIMESTAMP NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_trial_ends (trial_ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 20. subscription_invoices
-- =============================================
CREATE TABLE subscription_invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT NOT NULL,
    amount DECIMAL(8, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending','processing','completed','failed','refunded') DEFAULT 'pending',
    description VARCHAR(255) NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    INDEX idx_subscription (subscription_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 21. user_payment_methods
-- =============================================
CREATE TABLE user_payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    last_four VARCHAR(4) NOT NULL,
    brand VARCHAR(20) NULL,
    is_default BOOLEAN DEFAULT FALSE,
    expires_at DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Seed data
-- =============================================

INSERT INTO service_categories (name, slug, description, icon, sort_order) VALUES
('Bocetos y Diseno', 'bocetos-diseno', 'Ilustracion de moda y diseno de colecciones', 'Pencil', 1),
('Fichas Tecnicas', 'fichas-tecnicas', 'Documentacion tecnica de prendas', 'FileText', 2),
('Patronaje Digital', 'patronaje-digital', 'Patronaje 2D/3D y escalado', 'Ruler', 3),
('Confeccion de Muestras', 'confeccion-muestras', 'Prototipos y muestras pre-produccion', 'Scissors', 4),
('Produccion Limitada', 'produccion-limitada', 'Producciones capsula y ediciones especiales', 'Package', 5),
('Produccion Masiva', 'produccion-masiva', 'Produccion industrial a gran escala', 'Factory', 6);

INSERT INTO companies (id, name, slug, type, legal_id, description, phone, email, address_line1, city, state, country, latitude, longitude, employee_count, founded_year, is_verified, is_active, verified_at) VALUES
(1, 'Luna Collection', 'luna-collection', 'brand', '900123456-1', 'Marca de moda femenina casual con enfoque en tendencias contemporaneas.', '+57 310 200 1001', 'laura@lunacollection.co', 'Calle 85 #15-32', 'Bogota', 'Cundinamarca', 'Colombia', 4.6697, -74.0530, '1-10', 2022, TRUE, TRUE, NOW()),
(2, 'UrbanWear Co', 'urbanwear-co', 'brand', '900234567-2', 'Streetwear urbano para hombres. Hoodies, joggers y camisetas oversize.', '+57 311 300 2002', 'carlos@urbanwear.co', 'Calle 10 #4-18', 'Medellin', 'Antioquia', 'Colombia', 6.2442, -75.5812, '1-10', 2023, TRUE, TRUE, NOW()),
(3, 'EcoVerde Fashion', 'ecoverde-fashion', 'brand', '900345678-3', 'Moda sostenible femenina. Materiales organicos y procesos eticos.', '+57 312 400 3003', 'isabel@ecoverde.co', 'Avenida 6N #25-60', 'Cali', 'Valle del Cauca', 'Colombia', 3.4516, -76.5320, '1-10', 2021, TRUE, TRUE, NOW()),
(4, 'StreetStyle Lab', 'streetstyle-lab', 'brand', '900456789-4', 'Laboratorio de moda urbana. Drops limitados y colaboraciones.', '+57 313 500 4004', 'pedro@streetstyle.co', 'Carrera 43A #1Sur-100', 'Medellin', 'Antioquia', 'Colombia', 6.2476, -75.5658, '1-10', 2024, TRUE, TRUE, NOW()),
(5, 'Alta Moda Studio', 'alta-moda-studio', 'brand', '900567890-5', 'Alta costura y vestidos de gala. Diseno exclusivo para eventos.', '+57 314 600 5005', 'maria@altamoda.co', 'Calle 93 #11A-28', 'Bogota', 'Cundinamarca', 'Colombia', 4.6783, -74.0472, '1-10', 2020, TRUE, TRUE, NOW()),
(6, 'Textiles Antioquia SAS', 'textiles-antioquia', 'manufacturer', '800111222-1', 'Planta de confeccion con experiencia en tejido plano y punto.', '+57 604 444 5555', 'ventas@textilesantioquia.co', 'Calle 30 #65-100 Zona Industrial', 'Medellin', 'Antioquia', 'Colombia', 6.2518, -75.5636, '51-200', 2011, TRUE, TRUE, NOW()),
(7, 'Confecciones del Pacifico', 'confecciones-pacifico', 'manufacturer', '800222333-2', 'Taller especializado en moda sostenible.', '+57 602 555 6666', 'info@confeccionespacifico.co', 'Carrera 1 #20-45', 'Cali', 'Valle del Cauca', 'Colombia', 3.4372, -76.5225, '11-50', 2015, TRUE, TRUE, NOW()),
(8, 'Bogota Fashion Factory', 'bogota-fashion-factory', 'manufacturer', '800333444-3', 'Fabrica urbana de moda rapida y streetwear.', '+57 601 666 7777', 'produccion@bogotaff.co', 'Avenida Boyaca #68D-35', 'Bogota', 'Cundinamarca', 'Colombia', 4.6609, -74.1146, '51-200', 2013, TRUE, TRUE, NOW()),
(9, 'EcoTextil Colombia', 'ecotextil-colombia', 'manufacturer', '800444555-4', 'Textiles reciclados con certificaciones internacionales.', '+57 606 777 8888', 'contacto@ecotextil.co', 'Zona Franca Pereira Lote 5', 'Pereira', 'Risaralda', 'Colombia', 4.8133, -75.6961, '201-500', 2009, TRUE, TRUE, NOW());

-- =============================================
-- Contraseña estandarizada para TODOS los usuarios de prueba:
--   Email / Contraseña
--   ─────────────────────────────────────────────
--   admin@tidyhubb.test          / Test1234!   (rol: admin)
--   laura@lunacollection.co      / Test1234!   (rol: brand,  empresa: Luna Collection)
--   ricardo@textilesantioquia.co / Test1234!   (rol: manufacturer, empresa: Textiles Antioquia SAS)
-- =============================================
-- Hash bcrypt-12 de "Test1234!":
SET @pwd = '$2b$12$0AJqdete69Suw4NRWXoooeLxQ/ilIbzl1zGZwtjYNQp3EBUwGb/sq';

INSERT INTO users (id, email, password, first_name, last_name, phone, role, company_id, terms_accepted, email_verified, email_verified_at, is_active) VALUES
(1, 'admin@tidyhubb.test',           @pwd, 'Admin',   'Tidy Hubb', '+57 300 999 9999', 'admin',        NULL, TRUE, TRUE, NOW(), TRUE),
(2, 'laura@lunacollection.co',       @pwd, 'Laura',   'Martinez',  '+57 310 200 1001', 'brand',        1,    TRUE, TRUE, NOW(), TRUE),
(3, 'carlos@urbanwear.co',           @pwd, 'Carlos',  'Gomez',     '+57 311 300 2002', 'brand',        2,    TRUE, TRUE, NOW(), TRUE),
(4, 'isabel@ecoverde.co',            @pwd, 'Isabel',  'Torres',    '+57 312 400 3003', 'brand',        3,    TRUE, TRUE, NOW(), TRUE),
(5, 'pedro@streetstyle.co',          @pwd, 'Pedro',   'Sanchez',   '+57 313 500 4004', 'brand',        4,    TRUE, TRUE, NOW(), TRUE),
(6, 'maria@altamoda.co',             @pwd, 'Maria',   'Lopez',     '+57 314 600 5005', 'brand',        5,    TRUE, TRUE, NOW(), TRUE),
(7, 'ricardo@textilesantioquia.co',  @pwd, 'Ricardo', 'Montoya',   '+57 604 444 5555', 'manufacturer', 6,    TRUE, TRUE, NOW(), TRUE),
(8, 'daniela@confeccionespacifico.co', @pwd, 'Daniela', 'Ospina', '+57 602 555 6666', 'manufacturer', 7,    TRUE, TRUE, NOW(), TRUE),
(9, 'felipe@bogotaff.co',            @pwd, 'Felipe',  'Vargas',    '+57 601 666 7777', 'manufacturer', 8,    TRUE, TRUE, NOW(), TRUE),
(10, 'natalia@ecotextil.co',         @pwd, 'Natalia', 'Ramirez',   '+57 606 777 8888', 'manufacturer', 9,    TRUE, TRUE, NOW(), TRUE);

INSERT INTO manufacturer_capabilities (company_id, category_id, min_order_qty, max_monthly_capacity, lead_time_days, description) VALUES
(6, 5, 50, 2000, 21, 'Produccion capsulas y tirajes cortos en tejido plano y punto'),
(6, 6, 200, 10000, 45, 'Produccion masiva con lineas automatizadas'),
(6, 4, 1, 50, 10, 'Confeccion de muestras y prototipos'),
(7, 4, 1, 30, 7, 'Prototipos artesanales en materiales organicos'),
(7, 5, 10, 200, 18, 'Produccion limitada con procesos sostenibles'),
(8, 5, 20, 1500, 15, 'Produccion capsulas streetwear con estampado digital'),
(8, 6, 200, 8000, 40, 'Produccion masiva con sublimacion y serigrafia'),
(9, 5, 50, 3000, 20, 'Produccion limitada con fibras PET recicladas'),
(9, 6, 500, 20000, 35, 'Produccion masiva de textiles reciclados');

INSERT INTO manufacturer_certifications (company_id, name, issued_by, issued_at, expires_at, is_verified) VALUES
(7, 'GOTS', 'Control Union', '2025-06-01', '2027-05-31', TRUE),
(7, 'Fair Trade', 'Fairtrade International', '2025-03-15', '2027-03-14', TRUE),
(9, 'GRS (Global Recycled Standard)', 'Textile Exchange', '2025-01-10', '2027-01-09', TRUE),
(9, 'OEKO-TEX Standard 100', 'OEKO-TEX Association', '2025-08-20', '2026-08-19', TRUE),
(9, 'BCI (Better Cotton Initiative)', 'Better Cotton', '2025-04-01', '2027-03-31', TRUE),
(6, 'ISO 9001:2015', 'ICONTEC', '2024-11-01', '2027-10-31', TRUE);

INSERT INTO rfq_projects (code, brand_company_id, created_by_user_id, category_id, title, description, quantity, budget_min, budget_max, deadline, proposals_deadline, status, requires_sample, preferred_materials, sustainability_priority, proposals_count) VALUES
('RFQ-2026-001', 2, 3, 6, 'Produccion 500 camisetas basicas streetwear', 'Necesitamos producir 500 camisetas oversize en 5 tallas (XS-XL) con estampado frontal en serigrafia.', 500, 7000000, 10000000, '2026-05-15', '2026-03-20', 'open', TRUE, 'Algodon peinado 180g, tintura reactiva', FALSE, 3),
('RFQ-2026-002', 3, 4, 5, 'Coleccion capsula vestidos organicos', 'Produccion de 80 vestidos en 4 estilos (20 de cada uno). Prioridad en sostenibilidad.', 80, 3000000, 5000000, '2026-06-01', '2026-03-25', 'open', TRUE, 'Algodon organico GOTS, botones de tagua', TRUE, 2),
('RFQ-2026-003', 1, 2, 5, 'Drop limitado hoodies Luna Collection', 'Produccion de 150 hoodies oversize para drop de primavera.', 150, 5000000, 8000000, '2026-04-20', '2026-03-15', 'evaluating', TRUE, 'French terry 320g algodon/poliester', FALSE, 3);

INSERT INTO proposals (rfq_id, manufacturer_company_id, submitted_by_user_id, unit_price, total_price, lead_time_days, proposed_materials, recycled_percentage, notes, status, green_score, distance_km) VALUES
(1, 6, 7, 16000, 8000000, 40, 'Algodon peinado 180g nacional', 0, 'Incluimos muestras de estampado en 3 tecnicas.', 'submitted', 32.50, 5.20),
(1, 8, 9, 17500, 8750000, 35, 'Algodon peinado 180g importado', 10, 'Usamos tintas base agua.', 'submitted', 55.80, 380.00),
(1, 9, 10, 19000, 9500000, 30, 'Algodon reciclado 180g (40% PET)', 40, 'Material con certificacion GRS.', 'submitted', 78.30, 290.00),
(2, 7, 8, 52000, 4160000, 25, 'Algodon organico GOTS certificado', 30, 'Trazabilidad completa del algodon.', 'submitted', 91.50, 18.50),
(2, 9, 10, 48000, 3840000, 35, 'Blend reciclado + organico', 60, 'Maxima sostenibilidad.', 'submitted', 85.20, 310.00),
(3, 6, 7, 42000, 6300000, 28, 'French terry 320g', 0, 'Experiencia en hoodies oversize.', 'shortlisted', 45.00, 380.00),
(3, 8, 9, 39000, 5850000, 22, 'French terry 320g premium', 5, 'Entregas parciales posibles.', 'shortlisted', 62.30, 8.50),
(3, 7, 8, 48000, 7200000, 30, 'French terry organico 320g', 25, 'Bordado artesanal.', 'submitted', 72.10, 310.00);

-- Actualizar propuestas aceptadas (para los contratos que se van a crear)
UPDATE proposals SET status = 'accepted' WHERE rfq_id = 3 AND manufacturer_company_id = 8;
UPDATE rfq_projects SET status = 'awarded', awarded_proposal_id = 7 WHERE id = 3;

-- =============================================
-- Seed: contracts
-- =============================================
INSERT INTO contracts (code, rfq_id, proposal_id, brand_company_id, manufacturer_company_id, total_amount, currency, status, terms, start_date, expected_end_date) VALUES
('CTR-2026-001', 3, 7, 1, 8, 5850000, 'COP', 'in_production', 'Produccion de 150 hoodies oversize French terry 320g premium. Entrega en 3 parciales de 50 unidades.', '2026-03-10', '2026-04-20');

-- =============================================
-- Seed: contract_milestones
-- =============================================

INSERT INTO contract_milestones (contract_id, title, description, sort_order, status, payment_amount, payment_status, due_date) VALUES
(1, 'Muestra aprobada', 'Fabricacion y aprobacion de muestra fisica', 1, 'completed', 585000, 'paid', '2026-03-15'),
(1, 'Primera entrega (50 uds)', 'Produccion y entrega del primer lote', 2, 'in_progress', 1950000, 'pending', '2026-03-28'),
(1, 'Segunda entrega (50 uds)', 'Produccion y entrega del segundo lote', 3, 'pending', 1950000, 'pending', '2026-04-10'),
(1, 'Entrega final (50 uds)', 'Ultimo lote y cierre del contrato', 4, 'pending', 1365000, 'pending', '2026-04-20');

-- =============================================
-- Tabla: strategy_call_purchases
-- Registra pagos únicos por la Project Strategy Call
-- =============================================

CREATE TABLE IF NOT EXISTS strategy_call_purchases (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  stripe_session_id VARCHAR(255) NOT NULL UNIQUE,
  status          ENUM('pending','paid','refunded') NOT NULL DEFAULT 'pending',
  amount_usd      DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_scp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_scp_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
