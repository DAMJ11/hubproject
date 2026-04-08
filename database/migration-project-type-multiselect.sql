-- Migration: widen project_type to store multiple selected service types
-- Date: 2026-04-08

ALTER TABLE rfq_projects
MODIFY COLUMN project_type VARCHAR(255) NULL;