-- AlterTable: add google_id and auth_provider to users
ALTER TABLE `users`
  ADD COLUMN `google_id` VARCHAR(255) NULL,
  ADD COLUMN `auth_provider` VARCHAR(20) NOT NULL DEFAULT 'local';

-- CreateIndex
CREATE UNIQUE INDEX `users_google_id_key` ON `users`(`google_id`);
