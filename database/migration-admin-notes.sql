-- Migration: Create admin_notes table
-- Date: 2026-04-09
-- Description: Generic admin notes system for rfq_project, company, user, contract entities

CREATE TABLE IF NOT EXISTS admin_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL COMMENT 'rfq_project | company | user | contract',
  entity_id INT NOT NULL,
  admin_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_admin (admin_id),
  CONSTRAINT fk_admin_notes_user FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
