-- ============================================================
-- Migration: Fases 4, 5 y 6 — Abril 2026
-- Crear proyectos por admin, sistema de facturas, notificaciones
-- ============================================================

-- FASE 4: Admin-created projects
ALTER TABLE rfq_projects ADD COLUMN created_by_admin_id INT NULL AFTER created_by_user_id;
ALTER TABLE rfq_projects ADD CONSTRAINT fk_rfq_admin_creator FOREIGN KEY (created_by_admin_id) REFERENCES users(id);

-- Allow contracts without a proposal (admin-assigned)
ALTER TABLE contracts MODIFY COLUMN proposal_id INT NULL;

-- FASE 5: Invoices (facturas con negociación)
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  contract_id INT NOT NULL,
  conversation_id INT NULL,

  -- Montos
  production_cost DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  other_costs DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  platform_fee_rate DECIMAL(5,2) DEFAULT 3,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Negociación
  status ENUM('draft','pending_approval','revision_requested','approved','payment_processing','paid','cancelled') DEFAULT 'draft',
  proposed_by INT NOT NULL,
  notes TEXT NULL,

  -- Pago Stripe
  paid_at DATETIME NULL,
  stripe_payment_intent_id VARCHAR(255) NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_invoice_contract (contract_id),
  INDEX idx_invoice_conversation (conversation_id),
  INDEX idx_invoice_status (status),
  FOREIGN KEY (contract_id) REFERENCES contracts(id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (proposed_by) REFERENCES users(id)
);

-- Add 'invoice' to message_type enum
ALTER TABLE messages MODIFY COLUMN message_type ENUM('text','image','file','system','invoice') DEFAULT 'text';

-- Add metadata JSON to messages for invoice references
ALTER TABLE messages ADD COLUMN metadata JSON NULL AFTER file_url;
