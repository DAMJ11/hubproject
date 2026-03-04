-- =============================================
-- TidyHubb Database Schema
-- Plataforma de servicios de mantenimiento y aseo del hogar
-- =============================================

CREATE DATABASE IF NOT EXISTS hubproject
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE hubproject;

-- =============================================
-- 1. USERS - Usuarios (clientes y admins)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NULL,
    avatar_url VARCHAR(500) NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    terms_accepted BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. ADDRESSES - Direcciones de usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    label VARCHAR(100) NOT NULL DEFAULT 'Casa',
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. SERVICE_CATEGORIES - Categorías de servicio
-- =============================================
CREATE TABLE IF NOT EXISTS service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NULL,
    icon VARCHAR(50) NULL,
    image_url VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. SERVICES - Servicios ofrecidos
-- =============================================
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    description TEXT NULL,
    short_description VARCHAR(500) NULL,
    icon VARCHAR(50) NULL,
    image_url VARCHAR(500) NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    price_unit ENUM('hour', 'session', 'sqm', 'fixed') NOT NULL DEFAULT 'hour',
    estimated_duration INT NULL COMMENT 'Duracion estimada en minutos',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_slug (slug),
    INDEX idx_active_featured (is_active, is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. PROFESSIONALS - Profesionales verificados
-- =============================================
CREATE TABLE IF NOT EXISTS professionals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL COMMENT 'Si el profesional tambien tiene cuenta de usuario',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    bio TEXT NULL,
    experience_years INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    total_jobs INT DEFAULT 0,
    hourly_rate DECIMAL(10, 2) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_verified (is_verified),
    INDEX idx_available (is_available),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. PROFESSIONAL_SERVICES - Servicios que ofrece cada profesional (N:M)
-- =============================================
CREATE TABLE IF NOT EXISTS professional_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professional_id INT NOT NULL,
    service_id INT NOT NULL,
    custom_price DECIMAL(10, 2) NULL COMMENT 'Precio personalizado del profesional',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY uk_professional_service (professional_id, service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. PROFESSIONAL_AVAILABILITY - Disponibilidad
-- =============================================
CREATE TABLE IF NOT EXISTS professional_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professional_id INT NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '0=Dom, 1=Lun ... 6=Sab',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
    INDEX idx_professional (professional_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. BOOKINGS - Reservas de servicios
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    professional_id INT NULL,
    service_id INT NOT NULL,
    address_id INT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'pending',
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration INT NOT NULL COMMENT 'En minutos',
    actual_duration INT NULL,
    notes TEXT NULL,
    admin_notes TEXT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    payment_method VARCHAR(50) NULL,
    cancelled_by ENUM('user', 'professional', 'admin') NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
    INDEX idx_booking_code (booking_code),
    INDEX idx_user (user_id),
    INDEX idx_professional (professional_id),
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_date, scheduled_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. REVIEWS - Resenas de servicios
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    professional_id INT NOT NULL,
    service_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    admin_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_professional (professional_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. CONVERSATIONS - Conversaciones de chat
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    professional_id INT NULL,
    booking_id INT NULL,
    subject VARCHAR(255) NULL,
    status ENUM('open', 'closed', 'archived') DEFAULT 'open',
    last_message_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_professional (professional_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 11. MESSAGES - Mensajes dentro de conversaciones
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_type ENUM('user', 'professional', 'admin', 'system') NOT NULL,
    sender_id INT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    file_url VARCHAR(500) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation (conversation_id),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 12. NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('booking', 'message', 'payment', 'review', 'system', 'promo') NOT NULL,
    reference_type VARCHAR(50) NULL,
    reference_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 13. PAYMENTS - Registro de pagos
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    payment_method ENUM('cash', 'card', 'transfer', 'nequi', 'daviplata') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255) NULL,
    payment_gateway VARCHAR(50) NULL,
    paid_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_booking (booking_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 14. PROMO_CODES - Codigos de descuento
-- =============================================
CREATE TABLE IF NOT EXISTS promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_uses INT NULL,
    current_uses INT DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_code (code),
    INDEX idx_active_dates (is_active, valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SEED DATA - Categorias y servicios iniciales
-- =============================================

INSERT INTO service_categories (name, slug, description, icon, sort_order) VALUES
('Aseo del Hogar', 'aseo-hogar', 'Limpieza profunda y mantenimiento de tu hogar', 'Sparkles', 1),
('Jardineria', 'jardineria', 'Cuidado de jardines, podas y paisajismo', 'TreePine', 2),
('Plomeria', 'plomeria', 'Reparacion e instalacion de tuberias y grifos', 'Wrench', 3),
('Electricidad', 'electricidad', 'Instalacion y reparacion electrica profesional', 'Zap', 4),
('Pintura', 'pintura', 'Pintura interior y exterior de alta calidad', 'Paintbrush', 5),
('Cerrajeria', 'cerrajeria', 'Apertura, cambio de cerraduras y seguridad', 'KeyRound', 6),
('Fumigacion', 'fumigacion', 'Control de plagas y fumigacion profesional', 'Bug', 7),
('Carpinteria', 'carpinteria', 'Reparacion y fabricacion de muebles', 'Hammer', 8),
('Aires Acondicionados', 'aires-acondicionados', 'Instalacion, mantenimiento y reparacion de A/C', 'Wind', 9),
('Mudanzas', 'mudanzas', 'Servicio de mudanzas y transporte de muebles', 'Truck', 10);

INSERT INTO services (category_id, name, slug, description, short_description, base_price, price_unit, estimated_duration) VALUES
(1, 'Limpieza General', 'limpieza-general', 'Limpieza completa de tu hogar incluyendo pisos, banos, cocina y areas comunes.', 'Limpieza completa de tu hogar', 80000, 'session', 180),
(1, 'Limpieza Profunda', 'limpieza-profunda', 'Limpieza exhaustiva que incluye rincones, techos, detras de muebles y desinfeccion completa.', 'Limpieza exhaustiva y desinfeccion', 150000, 'session', 300),
(1, 'Limpieza de Oficina', 'limpieza-oficina', 'Limpieza profesional de oficinas y espacios comerciales.', 'Limpieza profesional para oficinas', 120000, 'session', 240),
(1, 'Lavado de Tapiceria', 'lavado-tapiceria', 'Lavado y desinfeccion de sofas, sillas, colchones y tapiceria en general.', 'Lavado de muebles tapizados', 100000, 'session', 120),
(2, 'Poda de Jardin', 'poda-jardin', 'Poda de arboles, arbustos y plantas ornamentales de tu jardin.', 'Poda profesional de jardin', 60000, 'session', 120),
(2, 'Mantenimiento de Jardin', 'mantenimiento-jardin', 'Corte de cesped, fertilizacion, riego y cuidado general del jardin.', 'Mantenimiento integral del jardin', 90000, 'session', 180),
(2, 'Diseno de Jardin', 'diseno-jardin', 'Diseno y creacion de jardines con plantas y paisajismo.', 'Diseno paisajistico profesional', 200000, 'session', 240),
(3, 'Reparacion de Fugas', 'reparacion-fugas', 'Deteccion y reparacion de fugas de agua en tuberias.', 'Solucion rapida a fugas', 70000, 'session', 90),
(3, 'Destape de Canerias', 'destape-canerias', 'Destape de canerias obstruidas con equipo profesional.', 'Destape de tuberias', 80000, 'session', 60),
(3, 'Instalacion Sanitaria', 'instalacion-sanitaria', 'Instalacion de sanitarios, lavamanos, duchas y griferia.', 'Instalacion de aparatos sanitarios', 120000, 'session', 180),
(4, 'Revision Electrica', 'revision-electrica', 'Diagnostico completo del sistema electrico de tu hogar.', 'Diagnostico electrico profesional', 60000, 'session', 60),
(4, 'Instalacion de Tomas', 'instalacion-tomas', 'Instalacion de tomacorrientes, interruptores y puntos de luz.', 'Instalacion de puntos electricos', 50000, 'hour', 60),
(4, 'Reparacion Electrica', 'reparacion-electrica', 'Reparacion de fallos electricos, cortocircuitos y averias.', 'Reparacion de problemas electricos', 80000, 'session', 120),
(5, 'Pintura Interior', 'pintura-interior', 'Pintura de paredes interiores con materiales de primera calidad.', 'Pintura para interiores', 25000, 'sqm', 480),
(5, 'Pintura Exterior', 'pintura-exterior', 'Pintura de fachadas y exteriores resistente a la intemperie.', 'Pintura para exteriores', 30000, 'sqm', 480),
(6, 'Apertura de Puertas', 'apertura-puertas', 'Apertura de puertas sin dano cuando se queda sin llaves.', 'Apertura de emergencia', 50000, 'fixed', 30),
(6, 'Cambio de Cerradura', 'cambio-cerradura', 'Cambio e instalacion de cerraduras de seguridad.', 'Instalacion de cerraduras nuevas', 80000, 'fixed', 60),
(7, 'Fumigacion Residencial', 'fumigacion-residencial', 'Control de plagas en hogares: cucarachas, hormigas, aranas.', 'Control de plagas para hogares', 100000, 'session', 120),
(7, 'Control de Roedores', 'control-roedores', 'Eliminacion y prevencion de ratones y ratas.', 'Eliminacion de roedores', 120000, 'session', 90),
(8, 'Reparacion de Muebles', 'reparacion-muebles', 'Reparacion y restauracion de muebles de madera.', 'Restauracion de muebles', 70000, 'session', 120),
(8, 'Muebles a Medida', 'muebles-medida', 'Fabricacion de muebles personalizados segun tus medidas.', 'Muebles a tu medida', 300000, 'fixed', 0),
(9, 'Mantenimiento A/C', 'mantenimiento-ac', 'Limpieza y mantenimiento preventivo de aires acondicionados.', 'Mantenimiento de A/C', 80000, 'session', 90),
(9, 'Instalacion A/C', 'instalacion-ac', 'Instalacion profesional de aires acondicionados.', 'Instalacion de A/C', 200000, 'fixed', 240),
(10, 'Mudanza Local', 'mudanza-local', 'Servicio de mudanza dentro de la misma ciudad con personal y vehiculo.', 'Mudanza dentro de la ciudad', 250000, 'fixed', 480),
(10, 'Mudanza Pequena', 'mudanza-pequena', 'Transporte de pocos muebles o electrodomesticos.', 'Transporte de articulos', 100000, 'fixed', 180);

-- SEED: Usuarios de ejemplo (1 admin, 1 user)
-- NOTA: Las contraseñas aquí son hashes bcrypt de ejemplo (texto claro: "password")
INSERT INTO users (email, password, first_name, last_name, phone, avatar_url, role, terms_accepted, email_verified, email_verified_at, is_active, created_at, updated_at)
VALUES
    ('admin@tidyhubb.test', '$2b$12$IQeUmt1Eqmnrzkgxzl/IguvUJiBDtehbKFkQT/2/03ZXkSXBd7A9K', 'Admin', 'TidyHubb', '+57 300 000 0001', NULL, 'admin', TRUE, TRUE, NOW(), TRUE, NOW(), NOW()),
    ('user@tidyhubb.test',  '$2b$12$IQeUmt1Eqmnrzkgxzl/IguvUJiBDtehbKFkQT/2/03ZXkSXBd7A9K', 'Cliente', 'Ejemplo', '+57 300 000 0002', NULL, 'user', TRUE, TRUE, NOW(), TRUE, NOW(), NOW());