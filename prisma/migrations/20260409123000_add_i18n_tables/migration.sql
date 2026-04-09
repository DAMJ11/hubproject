-- Add i18n tables to Prisma schema

CREATE TABLE IF NOT EXISTS i18n_keys (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  key_path VARCHAR(255) NOT NULL UNIQUE,
  module VARCHAR(100) NOT NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_i18n_keys_module (module),
  INDEX idx_i18n_keys_active (is_active)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS i18n_values (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  key_id INT NOT NULL,
  locale VARCHAR(5) NOT NULL,
  value_text MEDIUMTEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  created_by_user_id INT NOT NULL,
  published_by_user_id INT NULL,
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_i18n_values_key_locale_version (key_id, locale, version),
  INDEX idx_i18n_values_key_locale (key_id, locale),
  INDEX idx_i18n_values_locale_status (locale, status)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS i18n_audit_logs (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  key_path VARCHAR(255) NOT NULL,
  locale VARCHAR(5) NOT NULL,
  old_value MEDIUMTEXT NULL,
  new_value MEDIUMTEXT NOT NULL,
  action VARCHAR(20) NOT NULL,
  changed_by_user_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_i18n_audit_key_locale (key_path, locale),
  INDEX idx_i18n_audit_created (created_at)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
