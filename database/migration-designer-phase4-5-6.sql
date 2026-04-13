-- Migration for Designer Phases 4, 5, 6
-- Phase 4: Marketplace (likes)
-- Phase 5: Trilateral Flow (conversation + contract extensions)
-- Phase 6: Payments/Commission (payouts + Stripe Connect)

-- ============================================
-- PHASE 4: Design Likes
-- ============================================

CREATE TABLE IF NOT EXISTS `design_likes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `designer_portfolio_item_id` INT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `design_likes_user_id_designer_portfolio_item_id_key` (`user_id`, `designer_portfolio_item_id`),
  INDEX `idx_design_like_user` (`user_id`),
  INDEX `idx_design_like_item` (`designer_portfolio_item_id`),
  CONSTRAINT `design_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `design_likes_designer_portfolio_item_id_fkey` FOREIGN KEY (`designer_portfolio_item_id`) REFERENCES `designer_portfolio_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- PHASE 5: Trilateral Flow - Conversation extensions
-- ============================================

ALTER TABLE `conversations`
  ADD COLUMN IF NOT EXISTS `design_project_id` INT NULL,
  ADD COLUMN IF NOT EXISTS `designer_profile_id` INT NULL;

CREATE INDEX IF NOT EXISTS `idx_conv_design_project` ON `conversations`(`design_project_id`);
CREATE INDEX IF NOT EXISTS `idx_conv_designer` ON `conversations`(`designer_profile_id`);

ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_design_project_id_fkey` FOREIGN KEY (`design_project_id`) REFERENCES `design_projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_designer_profile_id_fkey` FOREIGN KEY (`designer_profile_id`) REFERENCES `designer_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `contracts`
  ADD COLUMN IF NOT EXISTS `design_project_id` INT NULL;

CREATE INDEX IF NOT EXISTS `idx_contract_design_project` ON `contracts`(`design_project_id`);

ALTER TABLE `contracts`
  ADD CONSTRAINT `contracts_design_project_id_fkey` FOREIGN KEY (`design_project_id`) REFERENCES `design_projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- PHASE 6: Designer Payouts + Stripe Connect
-- ============================================

ALTER TABLE `designer_profiles`
  ADD COLUMN IF NOT EXISTS `stripe_connect_id` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `stripe_onboarded` BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS `designer_payouts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `designer_profile_id` INT NOT NULL,
  `design_project_id` INT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `platform_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `net_amount` DECIMAL(10, 2) NOT NULL,
  `stripe_transfer_id` VARCHAR(255) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `paid_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_payout_designer` (`designer_profile_id`),
  INDEX `idx_payout_project` (`design_project_id`),
  INDEX `idx_payout_status` (`status`),
  CONSTRAINT `designer_payouts_designer_profile_id_fkey` FOREIGN KEY (`designer_profile_id`) REFERENCES `designer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `designer_payouts_design_project_id_fkey` FOREIGN KEY (`design_project_id`) REFERENCES `design_projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
