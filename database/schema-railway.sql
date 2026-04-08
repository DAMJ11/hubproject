-- =============================================
-- HUBPROJECT Schema for Railway (SAFE - no DROP)
-- Adapted: no CREATE DATABASE / USE (Railway provides 'railway' DB)
-- Uses CREATE TABLE IF NOT EXISTS to be safe for re-execution.
-- NEVER drops existing tables or data.
-- =============================================

-- =============================================
-- 1. service_categories
-- =============================================
CREATE TABLE IF NOT EXISTS service_categories (
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
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    type ENUM('brand', 'manufacturer') NOT NULL,
    legal_id VARCHAR(50) NULL,
    description TEXT NULL,
    logo_url MEDIUMTEXT NULL,
    cover_image_url MEDIUMTEXT NULL,
    website VARCHAR(500) NULL,
    instagram_handle VARCHAR(120) NULL,
    brand_categories TEXT NULL,
    brand_tagline VARCHAR(160) NULL,
    ships_worldwide BOOLEAN NOT NULL DEFAULT FALSE,
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
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NULL,
    avatar_url MEDIUMTEXT NULL,
    preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
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
-- 4. addresses
-- =============================================
CREATE TABLE IF NOT EXISTS addresses (
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
CREATE TABLE IF NOT EXISTS manufacturer_capabilities (
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
CREATE TABLE IF NOT EXISTS manufacturer_certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    issued_by VARCHAR(200) NULL,
    certificate_url MEDIUMTEXT NULL,
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
CREATE TABLE IF NOT EXISTS rfq_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    project_type VARCHAR(255) NULL,
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
CREATE TABLE IF NOT EXISTS rfq_materials (
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
CREATE TABLE IF NOT EXISTS rfq_attachments (
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
CREATE TABLE IF NOT EXISTS proposals (
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
CREATE TABLE IF NOT EXISTS contracts (
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
CREATE TABLE IF NOT EXISTS contract_milestones (
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
-- 13. conversations
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
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
-- 14. messages
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
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
-- 15. reviews
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
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
-- 16. payments
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
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
-- 17. notifications
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
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
CREATE TABLE IF NOT EXISTS subscription_plans (
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
CREATE TABLE IF NOT EXISTS subscriptions (
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
CREATE TABLE IF NOT EXISTS subscription_invoices (
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
CREATE TABLE IF NOT EXISTS user_payment_methods (
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
