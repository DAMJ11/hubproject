-- =============================================
-- Migración: Email verification + Password reset tokens
-- Fecha: 2026-03-31
-- =============================================

-- 1. Token de verificación de email en users
ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255) NULL AFTER email_verified_at;
ALTER TABLE users ADD COLUMN email_verification_expires DATETIME NULL AFTER email_verification_token;

-- 2. Tabla de tokens de reset de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Índices
CREATE INDEX idx_verification_token ON users(email_verification_token);
CREATE INDEX idx_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_user ON password_reset_tokens(user_id);
