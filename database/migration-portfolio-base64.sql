-- Migration: Ampliar certificate_url de VARCHAR(500) a MEDIUMTEXT
-- para soportar imágenes en formato Base64
-- Fecha: 2026-04-06
-- Aplicar en Railway con:
--   mysql -u user -p dbname < migration-portfolio-base64.sql

ALTER TABLE manufacturer_certifications
  MODIFY COLUMN certificate_url MEDIUMTEXT NULL;
