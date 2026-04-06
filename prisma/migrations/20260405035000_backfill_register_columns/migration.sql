-- Backfill columns required by /api/auth/register in environments
-- where users table was created from legacy SQL without these fields.

-- Some MySQL variants in managed environments don't support
-- "ADD COLUMN IF NOT EXISTS". Use INFORMATION_SCHEMA + dynamic SQL.

SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email_verification_token'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `email_verification_token` VARCHAR(255) NULL AFTER `email_verified_at`',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email_verification_expires'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `email_verification_expires` DATETIME(0) NULL AFTER `email_verification_token`',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
