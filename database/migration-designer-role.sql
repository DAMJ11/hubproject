-- Migration: Designer Role - Phase 1 Foundations
-- Date: 2026-04-09
-- Description: Add designer role enum values, create designer_profiles table

-- 1. Add 'designer' to users_role enum
ALTER TABLE users MODIFY COLUMN role ENUM('brand','manufacturer','admin','super_admin','designer') NOT NULL DEFAULT 'brand';

-- 2. Add 'designer_studio' to CompanyType enum  
ALTER TABLE companies MODIFY COLUMN company_type ENUM('brand','manufacturer','designer_studio') NOT NULL DEFAULT 'brand';

-- 3. Add 'designer' to subscription_plans target_role enum
ALTER TABLE subscription_plans MODIFY COLUMN target_role ENUM('brand','manufacturer','designer') NOT NULL;

-- 4. Create designer_profiles table
CREATE TABLE IF NOT EXISTS designer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_id INT NULL,
  display_name VARCHAR(255) NOT NULL,
  bio TEXT NULL,
  specialties JSON NULL,
  years_experience INT NULL DEFAULT 0,
  portfolio_url VARCHAR(500) NULL,
  instagram_handle VARCHAR(100) NULL,
  behance_url VARCHAR(500) NULL,
  dribbble_url VARCHAR(500) NULL,
  linkedin_url VARCHAR(500) NULL,
  website_url VARCHAR(500) NULL,
  location_city VARCHAR(255) NULL,
  location_country VARCHAR(100) NULL DEFAULT 'Colombia',
  availability_status ENUM('available','busy','unavailable') NOT NULL DEFAULT 'available',
  hourly_rate_min DECIMAL(10,2) NULL,
  hourly_rate_max DECIMAL(10,2) NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  total_reviews INT NOT NULL DEFAULT 0,
  projects_completed INT NOT NULL DEFAULT 0,
  is_freelance BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url VARCHAR(500) NULL,
  cover_image_url VARCHAR(500) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_designer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_designer_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  INDEX idx_designer_availability (availability_status),
  INDEX idx_designer_specialties ((CAST(specialties AS CHAR(255)))),
  INDEX idx_designer_location (location_country, location_city),
  INDEX idx_designer_verified (is_verified),
  INDEX idx_designer_rating (rating_avg)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
