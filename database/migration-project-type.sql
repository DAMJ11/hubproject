-- Migration: Add project_type column to rfq_projects
-- Date: 2026-04-XX

ALTER TABLE rfq_projects
ADD COLUMN project_type VARCHAR(50) NULL AFTER code;
