-- Migration: Designer Role Phase 3 - Design Projects & Proposals (RFQ)
-- Date: 2026-04-13
-- Description: Creates design_projects and design_proposals tables, adds new notification types

-- 1. Add new notification types
ALTER TABLE notifications MODIFY COLUMN type ENUM('message','payment','review','system','rfq','proposal','contract','design_project','design_proposal') NOT NULL;

-- 2. Create design_projects table
CREATE TABLE IF NOT EXISTS design_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  brand_company_id INT NOT NULL,
  created_by_user_id INT NOT NULL,
  designer_profile_id INT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reference_images TEXT NULL,
  season VARCHAR(30) NULL,
  budget_min DECIMAL(12,2) NULL,
  budget_max DECIMAL(12,2) NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  deadline DATE NULL,
  proposals_deadline DATE NULL,
  status ENUM('draft','open','in_progress','review','completed','cancelled') NOT NULL DEFAULT 'draft',
  manufacturer_id INT NULL,
  proposals_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_dp_brand (brand_company_id),
  INDEX idx_dp_designer (designer_profile_id),
  INDEX idx_dp_status (status),
  INDEX idx_dp_created_by (created_by_user_id),

  CONSTRAINT fk_dp_brand FOREIGN KEY (brand_company_id) REFERENCES companies(id),
  CONSTRAINT fk_dp_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_dp_designer FOREIGN KEY (designer_profile_id) REFERENCES designer_profiles(id),
  CONSTRAINT fk_dp_manufacturer FOREIGN KEY (manufacturer_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create design_proposals table
CREATE TABLE IF NOT EXISTS design_proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  design_project_id INT NOT NULL,
  designer_profile_id INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  estimated_days INT NOT NULL,
  concept_notes TEXT NULL,
  sample_attachments TEXT NULL,
  status ENUM('submitted','shortlisted','accepted','rejected','withdrawn') NOT NULL DEFAULT 'submitted',
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME NULL,

  UNIQUE INDEX idx_dp_unique_proposal (design_project_id, designer_profile_id),
  INDEX idx_dpr_designer (designer_profile_id),
  INDEX idx_dpr_status (status),

  CONSTRAINT fk_dpr_project FOREIGN KEY (design_project_id) REFERENCES design_projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_dpr_designer FOREIGN KEY (designer_profile_id) REFERENCES designer_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
