-- Tabla: strategy_call_purchases
-- Registra pagos unicos por la Project Strategy Call
CREATE TABLE IF NOT EXISTS strategy_call_purchases (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL,
    stripe_session_id VARCHAR(255) NOT NULL UNIQUE,
    status            ENUM('pending', 'paid', 'refunded') NOT NULL DEFAULT 'pending',
    amount_usd        DECIMAL(10, 2) NOT NULL DEFAULT 150.00,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_scp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_scp_user (user_id)
);