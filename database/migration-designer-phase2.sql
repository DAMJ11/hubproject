-- Migration: Designer Phase 2 — Portfolio & Public Profile
-- Date: 2026-04-13
-- Description: Add new columns to designer_profiles, create designer_portfolio_items table

-- 1. Add new columns to designer_profiles
ALTER TABLE designer_profiles
  ADD COLUMN slug VARCHAR(200) NULL UNIQUE AFTER display_name,
  ADD COLUMN dribbble_url VARCHAR(500) NULL AFTER behance_url,
  ADD COLUMN linkedin_url VARCHAR(500) NULL AFTER dribbble_url,
  ADD COLUMN website_url VARCHAR(500) NULL AFTER linkedin_url,
  ADD COLUMN total_reviews INT NOT NULL DEFAULT 0 AFTER rating_avg,
  ADD COLUMN avatar_url MEDIUMTEXT NULL AFTER is_freelance,
  ADD COLUMN cover_image_url MEDIUMTEXT NULL AFTER avatar_url;

-- 2. Add indexes
CREATE INDEX idx_designer_slug ON designer_profiles(slug);
CREATE INDEX idx_designer_availability ON designer_profiles(availability_status);
CREATE INDEX idx_designer_location ON designer_profiles(location_country);

-- 3. Create designer_portfolio_items table
CREATE TABLE IF NOT EXISTS designer_portfolio_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  designer_profile_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category VARCHAR(50) NOT NULL,
  season VARCHAR(30) NULL,
  year INT NULL,
  image_url MEDIUMTEXT NULL,
  tags TEXT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  views_count INT NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_portfolio_designer FOREIGN KEY (designer_profile_id)
    REFERENCES designer_profiles(id) ON DELETE CASCADE,
  INDEX idx_portfolio_designer (designer_profile_id),
  INDEX idx_portfolio_category (category),
  INDEX idx_portfolio_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Generate slugs for existing designer profiles (if any)
UPDATE designer_profiles
SET slug = CONCAT(LOWER(REPLACE(REPLACE(display_name, ' ', '-'), '.', '')), '-', id)
WHERE slug IS NULL;
