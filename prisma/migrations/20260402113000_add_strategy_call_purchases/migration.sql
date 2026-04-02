-- CreateTable
CREATE TABLE `strategy_call_purchases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `stripe_session_id` VARCHAR(255) NOT NULL,
    `status` ENUM('pending', 'paid', 'refunded') NOT NULL DEFAULT 'pending',
    `amount_usd` DECIMAL(10, 2) NOT NULL DEFAULT 150.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `strategy_call_purchases_stripe_session_id_key`(`stripe_session_id`),
    INDEX `idx_scp_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `strategy_call_purchases`
  ADD CONSTRAINT `strategy_call_purchases_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
