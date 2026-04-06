-- Migration: ampliar users.avatar_url para soportar Base64
-- Fecha: 2026-04-06

ALTER TABLE users
  MODIFY COLUMN avatar_url MEDIUMTEXT NULL;
