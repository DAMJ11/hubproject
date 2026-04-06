-- Backfill columns required by /api/auth/register in environments
-- where users table was created from legacy SQL without these fields.

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `email_verification_token` VARCHAR(255) NULL AFTER `email_verified_at`;

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `email_verification_expires` DATETIME(0) NULL AFTER `email_verification_token`;
