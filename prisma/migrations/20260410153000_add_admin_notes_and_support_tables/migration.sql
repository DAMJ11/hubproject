-- Reconcile schema drift between local SQL bootstrap and Prisma migrations.
-- These tables exist in schema.prisma but were created outside Prisma Migrate in some environments.

CREATE TABLE IF NOT EXISTS `admin_notes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` INT NOT NULL,
  `admin_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_entity` (`entity_type`, `entity_id`),
  INDEX `idx_admin` (`admin_id`),
  CONSTRAINT `fk_admin_notes_user`
    FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `support_chats` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `initiated_by_user_id` INT NOT NULL,
  `admin_user_id` INT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('pending','accepted','closed') NOT NULL DEFAULT 'pending',
  `accepted_at` DATETIME(3) NULL,
  `closed_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_admin_user` (`admin_user_id`),
  INDEX `idx_initiated_by` (`initiated_by_user_id`),
  CONSTRAINT `support_chats_admin_user_id_fkey`
    FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `support_chats_initiated_by_user_id_fkey`
    FOREIGN KEY (`initiated_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `support_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `support_chat_id` INT NOT NULL,
  `sender_user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_support_chat` (`support_chat_id`),
  INDEX `idx_sender` (`sender_user_id`),
  CONSTRAINT `support_messages_sender_user_id_fkey`
    FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `support_messages_support_chat_id_fkey`
    FOREIGN KEY (`support_chat_id`) REFERENCES `support_chats` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
