-- Add admin-created RFQ references, invoice workflow, and message metadata

ALTER TABLE rfq_projects
  ADD COLUMN created_by_admin_id INT NULL AFTER created_by_user_id;

ALTER TABLE contracts
  MODIFY COLUMN proposal_id INT NULL;

ALTER TABLE messages
  ADD COLUMN metadata JSON NULL AFTER file_url;

ALTER TABLE messages
  MODIFY COLUMN message_type ENUM('text', 'image', 'file', 'system', 'invoice') NOT NULL DEFAULT 'text';

CREATE TABLE IF NOT EXISTS invoices (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL,
  contract_id INT NOT NULL,
  conversation_id INT NULL,
  production_cost DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  other_costs DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  platform_fee_rate DECIMAL(5, 2) NOT NULL DEFAULT 3.00,
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  status ENUM('draft', 'pending_approval', 'revision_requested', 'approved', 'payment_processing', 'paid', 'cancelled') NOT NULL DEFAULT 'draft',
  proposed_by INT NOT NULL,
  notes TEXT NULL,
  paid_at DATETIME NULL,
  stripe_payment_intent_id VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX invoices_code_key (code),
  INDEX idx_invoice_contract (contract_id),
  INDEX idx_invoice_conversation (conversation_id),
  INDEX idx_invoice_status (status)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
