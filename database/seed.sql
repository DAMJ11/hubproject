-- ============================================================
-- UNIFIED SEED DATA — TidyHubb / Manufy-Clone
-- Fuente unificada de datos de prueba (antes schema.sql + seed.sql)
-- Ejecutar: mysql -u root -p hubproject < database/seed.sql
-- ============================================================

-- Claves estandarizadas para usuarios de prueba
-- Password plano: Test1234!
SET @pwd = '$2b$12$0AJqdete69Suw4NRWXoooeLxQ/ilIbzl1zGZwtjYNQp3EBUwGb/sq';

-- 1) service_categories
INSERT INTO service_categories (id, name, slug, description, icon, is_active, sort_order) VALUES
(1, 'Bocetos y Diseno', 'bocetos-diseno', 'Ilustracion de moda y diseno de colecciones', 'Pencil', TRUE, 1),
(2, 'Fichas Tecnicas', 'fichas-tecnicas', 'Documentacion tecnica de prendas', 'FileText', TRUE, 2),
(3, 'Patronaje Digital', 'patronaje-digital', 'Patronaje 2D/3D y escalado', 'Ruler', TRUE, 3),
(4, 'Confeccion de Muestras', 'confeccion-muestras', 'Prototipos y muestras pre-produccion', 'Scissors', TRUE, 4),
(5, 'Produccion Limitada', 'produccion-limitada', 'Producciones capsula y ediciones especiales', 'Package', TRUE, 5),
(6, 'Produccion Masiva', 'produccion-masiva', 'Produccion industrial a gran escala', 'Factory', TRUE, 6)
ON DUPLICATE KEY UPDATE
	name = VALUES(name),
	description = VALUES(description),
	icon = VALUES(icon),
	is_active = VALUES(is_active),
	sort_order = VALUES(sort_order);

-- 2) companies
INSERT INTO companies (id, name, slug, type, legal_id, description, phone, email, address_line1, city, state, country, latitude, longitude, employee_count, founded_year, is_verified, is_active, verified_at) VALUES
(1, 'Luna Collection', 'luna-collection', 'brand', '900123456-1', 'Marca de moda femenina casual con enfoque en tendencias contemporaneas.', '+57 310 200 1001', 'laura@lunacollection.co', 'Calle 85 #15-32', 'Bogota', 'Cundinamarca', 'Colombia', 4.6697, -74.0530, '1-10', 2022, TRUE, TRUE, NOW()),
(2, 'UrbanWear Co', 'urbanwear-co', 'brand', '900234567-2', 'Streetwear urbano para hombres. Hoodies, joggers y camisetas oversize.', '+57 311 300 2002', 'carlos@urbanwear.co', 'Calle 10 #4-18', 'Medellin', 'Antioquia', 'Colombia', 6.2442, -75.5812, '1-10', 2023, TRUE, TRUE, NOW()),
(3, 'EcoVerde Fashion', 'ecoverde-fashion', 'brand', '900345678-3', 'Moda sostenible femenina. Materiales organicos y procesos eticos.', '+57 312 400 3003', 'isabel@ecoverde.co', 'Avenida 6N #25-60', 'Cali', 'Valle del Cauca', 'Colombia', 3.4516, -76.5320, '1-10', 2021, TRUE, TRUE, NOW()),
(4, 'StreetStyle Lab', 'streetstyle-lab', 'brand', '900456789-4', 'Laboratorio de moda urbana. Drops limitados y colaboraciones.', '+57 313 500 4004', 'pedro@streetstyle.co', 'Carrera 43A #1Sur-100', 'Medellin', 'Antioquia', 'Colombia', 6.2476, -75.5658, '1-10', 2024, TRUE, TRUE, NOW()),
(5, 'Alta Moda Studio', 'alta-moda-studio', 'brand', '900567890-5', 'Alta costura y vestidos de gala. Diseno exclusivo para eventos.', '+57 314 600 5005', 'maria@altamoda.co', 'Calle 93 #11A-28', 'Bogota', 'Cundinamarca', 'Colombia', 4.6783, -74.0472, '1-10', 2020, TRUE, TRUE, NOW()),
(6, 'Textiles Antioquia SAS', 'textiles-antioquia', 'manufacturer', '800111222-1', 'Planta de confeccion con experiencia en tejido plano y punto.', '+57 604 444 5555', 'ventas@textilesantioquia.co', 'Calle 30 #65-100 Zona Industrial', 'Medellin', 'Antioquia', 'Colombia', 6.2518, -75.5636, '51-200', 2011, TRUE, TRUE, NOW()),
(7, 'Confecciones del Pacifico', 'confecciones-pacifico', 'manufacturer', '800222333-2', 'Taller especializado en moda sostenible.', '+57 602 555 6666', 'info@confeccionespacifico.co', 'Carrera 1 #20-45', 'Cali', 'Valle del Cauca', 'Colombia', 3.4372, -76.5225, '11-50', 2015, TRUE, TRUE, NOW()),
(8, 'Bogota Fashion Factory', 'bogota-fashion-factory', 'manufacturer', '800333444-3', 'Fabrica urbana de moda rapida y streetwear.', '+57 601 666 7777', 'produccion@bogotaff.co', 'Avenida Boyaca #68D-35', 'Bogota', 'Cundinamarca', 'Colombia', 4.6609, -74.1146, '51-200', 2013, TRUE, TRUE, NOW()),
(9, 'EcoTextil Colombia', 'ecotextil-colombia', 'manufacturer', '800444555-4', 'Textiles reciclados con certificaciones internacionales.', '+57 606 777 8888', 'contacto@ecotextil.co', 'Zona Franca Pereira Lote 5', 'Pereira', 'Risaralda', 'Colombia', 4.8133, -75.6961, '201-500', 2009, TRUE, TRUE, NOW())
ON DUPLICATE KEY UPDATE
	name = VALUES(name),
	slug = VALUES(slug),
	type = VALUES(type),
	legal_id = VALUES(legal_id),
	description = VALUES(description),
	phone = VALUES(phone),
	email = VALUES(email),
	address_line1 = VALUES(address_line1),
	city = VALUES(city),
	state = VALUES(state),
	country = VALUES(country),
	latitude = VALUES(latitude),
	longitude = VALUES(longitude),
	employee_count = VALUES(employee_count),
	founded_year = VALUES(founded_year),
	is_verified = VALUES(is_verified),
	is_active = VALUES(is_active),
	verified_at = VALUES(verified_at),
	updated_at = NOW();

-- 3) users principales (datos de negocio)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, company_id, terms_accepted, email_verified, email_verified_at, is_active) VALUES
(1, 'admin@tidyhubb.test', @pwd, 'Admin', 'Tidy Hubb', '+57 300 999 9999', 'admin', NULL, TRUE, TRUE, NOW(), TRUE),
(2, 'laura@lunacollection.co', @pwd, 'Laura', 'Martinez', '+57 310 200 1001', 'brand', 1, TRUE, TRUE, NOW(), TRUE),
(3, 'carlos@urbanwear.co', @pwd, 'Carlos', 'Gomez', '+57 311 300 2002', 'brand', 2, TRUE, TRUE, NOW(), TRUE),
(4, 'isabel@ecoverde.co', @pwd, 'Isabel', 'Torres', '+57 312 400 3003', 'brand', 3, TRUE, TRUE, NOW(), TRUE),
(5, 'pedro@streetstyle.co', @pwd, 'Pedro', 'Sanchez', '+57 313 500 4004', 'brand', 4, TRUE, TRUE, NOW(), TRUE),
(6, 'maria@altamoda.co', @pwd, 'Maria', 'Lopez', '+57 314 600 5005', 'brand', 5, TRUE, TRUE, NOW(), TRUE),
(7, 'ricardo@textilesantioquia.co', @pwd, 'Ricardo', 'Montoya', '+57 604 444 5555', 'manufacturer', 6, TRUE, TRUE, NOW(), TRUE),
(8, 'daniela@confeccionespacifico.co', @pwd, 'Daniela', 'Ospina', '+57 602 555 6666', 'manufacturer', 7, TRUE, TRUE, NOW(), TRUE),
(9, 'felipe@bogotaff.co', @pwd, 'Felipe', 'Vargas', '+57 601 666 7777', 'manufacturer', 8, TRUE, TRUE, NOW(), TRUE),
(10, 'natalia@ecotextil.co', @pwd, 'Natalia', 'Ramirez', '+57 606 777 8888', 'manufacturer', 9, TRUE, TRUE, NOW(), TRUE)
ON DUPLICATE KEY UPDATE
	email = VALUES(email),
	password = VALUES(password),
	first_name = VALUES(first_name),
	last_name = VALUES(last_name),
	phone = VALUES(phone),
	role = VALUES(role),
	company_id = VALUES(company_id),
	terms_accepted = VALUES(terms_accepted),
	email_verified = VALUES(email_verified),
	email_verified_at = VALUES(email_verified_at),
	is_active = VALUES(is_active),
	updated_at = NOW();

-- 4) usuarios alias de QA (compatibilidad con seed anterior)
INSERT INTO users (id, email, password, first_name, last_name, role, company_id, terms_accepted, email_verified, email_verified_at, is_active) VALUES
(101, 'brand@test.com', @pwd, 'Carlos', 'Marca', 'brand', 1, TRUE, TRUE, NOW(), TRUE),
(102, 'manufacturer@test.com', @pwd, 'Ana', 'Fabricante', 'manufacturer', 6, TRUE, TRUE, NOW(), TRUE),
(103, 'admin@test.com', @pwd, 'Admin', 'Sistema', 'admin', NULL, TRUE, TRUE, NOW(), TRUE)
ON DUPLICATE KEY UPDATE
	password = VALUES(password),
	first_name = VALUES(first_name),
	last_name = VALUES(last_name),
	role = VALUES(role),
	company_id = VALUES(company_id),
	terms_accepted = VALUES(terms_accepted),
	email_verified = VALUES(email_verified),
	email_verified_at = VALUES(email_verified_at),
	is_active = VALUES(is_active),
	updated_at = NOW();

-- 5) manufacturer_capabilities
INSERT INTO manufacturer_capabilities (company_id, category_id, min_order_qty, max_monthly_capacity, lead_time_days, description, is_active) VALUES
(6, 5, 50, 2000, 21, 'Produccion capsulas y tirajes cortos en tejido plano y punto', TRUE),
(6, 6, 200, 10000, 45, 'Produccion masiva con lineas automatizadas', TRUE),
(6, 4, 1, 50, 10, 'Confeccion de muestras y prototipos', TRUE),
(7, 4, 1, 30, 7, 'Prototipos artesanales en materiales organicos', TRUE),
(7, 5, 10, 200, 18, 'Produccion limitada con procesos sostenibles', TRUE),
(8, 5, 20, 1500, 15, 'Produccion capsulas streetwear con estampado digital', TRUE),
(8, 6, 200, 8000, 40, 'Produccion masiva con sublimacion y serigrafia', TRUE),
(9, 5, 50, 3000, 20, 'Produccion limitada con fibras PET recicladas', TRUE),
(9, 6, 500, 20000, 35, 'Produccion masiva de textiles reciclados', TRUE)
ON DUPLICATE KEY UPDATE
	min_order_qty = VALUES(min_order_qty),
	max_monthly_capacity = VALUES(max_monthly_capacity),
	lead_time_days = VALUES(lead_time_days),
	description = VALUES(description),
	is_active = VALUES(is_active);

-- 6) manufacturer_certifications
DELETE FROM manufacturer_certifications WHERE company_id IN (6, 7, 8, 9);

INSERT INTO manufacturer_certifications (company_id, name, issued_by, issued_at, expires_at, is_verified) VALUES
(7, 'GOTS', 'Control Union', '2025-06-01', '2027-05-31', TRUE),
(7, 'Fair Trade', 'Fairtrade International', '2025-03-15', '2027-03-14', TRUE),
(9, 'GRS (Global Recycled Standard)', 'Textile Exchange', '2025-01-10', '2027-01-09', TRUE),
(9, 'OEKO-TEX Standard 100', 'OEKO-TEX Association', '2025-08-20', '2026-08-19', TRUE),
(9, 'BCI (Better Cotton Initiative)', 'Better Cotton', '2025-04-01', '2027-03-31', TRUE),
(6, 'ISO 9001:2015', 'ICONTEC', '2024-11-01', '2027-10-31', TRUE);

-- 7) rfq_projects
INSERT INTO rfq_projects (id, code, brand_company_id, created_by_user_id, category_id, title, description, quantity, budget_min, budget_max, currency, deadline, proposals_deadline, status, requires_sample, preferred_materials, sustainability_priority, proposals_count) VALUES
(1, 'RFQ-2026-001', 2, 3, 6, 'Produccion 500 camisetas basicas streetwear', 'Necesitamos producir 500 camisetas oversize en 5 tallas (XS-XL) con estampado frontal en serigrafia.', 500, 7000000, 10000000, 'COP', '2026-05-15', '2026-03-20', 'open', TRUE, 'Algodon peinado 180g, tintura reactiva', FALSE, 3),
(2, 'RFQ-2026-002', 3, 4, 5, 'Coleccion capsula vestidos organicos', 'Produccion de 80 vestidos en 4 estilos (20 de cada uno). Prioridad en sostenibilidad.', 80, 3000000, 5000000, 'COP', '2026-06-01', '2026-03-25', 'open', TRUE, 'Algodon organico GOTS, botones de tagua', TRUE, 2),
(3, 'RFQ-2026-003', 1, 2, 5, 'Drop limitado hoodies Luna Collection', 'Produccion de 150 hoodies oversize para drop de primavera.', 150, 5000000, 8000000, 'COP', '2026-04-20', '2026-03-15', 'awarded', TRUE, 'French terry 320g algodon/poliester', FALSE, 3)
ON DUPLICATE KEY UPDATE
	code = VALUES(code),
	brand_company_id = VALUES(brand_company_id),
	created_by_user_id = VALUES(created_by_user_id),
	category_id = VALUES(category_id),
	title = VALUES(title),
	description = VALUES(description),
	quantity = VALUES(quantity),
	budget_min = VALUES(budget_min),
	budget_max = VALUES(budget_max),
	currency = VALUES(currency),
	deadline = VALUES(deadline),
	proposals_deadline = VALUES(proposals_deadline),
	status = VALUES(status),
	requires_sample = VALUES(requires_sample),
	preferred_materials = VALUES(preferred_materials),
	sustainability_priority = VALUES(sustainability_priority),
	proposals_count = VALUES(proposals_count),
	updated_at = NOW();

-- 8) rfq_materials (compatibilidad con seed anterior)
DELETE FROM rfq_materials WHERE rfq_id = 1;

INSERT INTO rfq_materials (rfq_id, material_type, composition, recycled_percentage, specifications) VALUES
(1, 'Algodon organico', '100% algodon organico certificado', 0, 'Gramaje: 180g/m2, pre-encogido'),
(1, 'Tinta eco', 'Tintas base agua', 100, 'Sin PVC, sin ftalatos');

-- 9) proposals
INSERT INTO proposals (id, rfq_id, manufacturer_company_id, submitted_by_user_id, unit_price, total_price, currency, lead_time_days, proposed_materials, recycled_percentage, notes, status, green_score, distance_km) VALUES
(1, 1, 6, 7, 16000, 8000000, 'COP', 40, 'Algodon peinado 180g nacional', 0, 'Incluimos muestras de estampado en 3 tecnicas.', 'submitted', 32.50, 5.20),
(2, 1, 8, 9, 17500, 8750000, 'COP', 35, 'Algodon peinado 180g importado', 10, 'Usamos tintas base agua.', 'submitted', 55.80, 380.00),
(3, 1, 9, 10, 19000, 9500000, 'COP', 30, 'Algodon reciclado 180g (40% PET)', 40, 'Material con certificacion GRS.', 'submitted', 78.30, 290.00),
(4, 2, 7, 8, 52000, 4160000, 'COP', 25, 'Algodon organico GOTS certificado', 30, 'Trazabilidad completa del algodon.', 'submitted', 91.50, 18.50),
(5, 2, 9, 10, 48000, 3840000, 'COP', 35, 'Blend reciclado + organico', 60, 'Maxima sostenibilidad.', 'submitted', 85.20, 310.00),
(6, 3, 6, 7, 42000, 6300000, 'COP', 28, 'French terry 320g', 0, 'Experiencia en hoodies oversize.', 'shortlisted', 45.00, 380.00),
(7, 3, 8, 9, 39000, 5850000, 'COP', 22, 'French terry 320g premium', 5, 'Entregas parciales posibles.', 'accepted', 62.30, 8.50),
(8, 3, 7, 8, 48000, 7200000, 'COP', 30, 'French terry organico 320g', 25, 'Bordado artesanal.', 'submitted', 72.10, 310.00)
ON DUPLICATE KEY UPDATE
	rfq_id = VALUES(rfq_id),
	manufacturer_company_id = VALUES(manufacturer_company_id),
	submitted_by_user_id = VALUES(submitted_by_user_id),
	unit_price = VALUES(unit_price),
	total_price = VALUES(total_price),
	currency = VALUES(currency),
	lead_time_days = VALUES(lead_time_days),
	proposed_materials = VALUES(proposed_materials),
	recycled_percentage = VALUES(recycled_percentage),
	notes = VALUES(notes),
	status = VALUES(status),
	green_score = VALUES(green_score),
	distance_km = VALUES(distance_km),
	updated_at = NOW();

UPDATE rfq_projects SET awarded_proposal_id = 7 WHERE id = 3;

-- 10) contracts
INSERT INTO contracts (id, code, rfq_id, proposal_id, brand_company_id, manufacturer_company_id, total_amount, currency, status, terms, start_date, expected_end_date) VALUES
(1, 'CTR-2026-001', 3, 7, 1, 8, 5850000, 'COP', 'in_production', 'Produccion de 150 hoodies oversize French terry 320g premium. Entrega en 3 parciales de 50 unidades.', '2026-03-10', '2026-04-20')
ON DUPLICATE KEY UPDATE
	rfq_id = VALUES(rfq_id),
	proposal_id = VALUES(proposal_id),
	brand_company_id = VALUES(brand_company_id),
	manufacturer_company_id = VALUES(manufacturer_company_id),
	total_amount = VALUES(total_amount),
	currency = VALUES(currency),
	status = VALUES(status),
	terms = VALUES(terms),
	start_date = VALUES(start_date),
	expected_end_date = VALUES(expected_end_date),
	updated_at = NOW();

-- 11) contract_milestones
INSERT INTO contract_milestones (id, contract_id, title, description, sort_order, status, payment_amount, payment_status, due_date) VALUES
(1, 1, 'Muestra aprobada', 'Fabricacion y aprobacion de muestra fisica', 1, 'completed', 585000, 'paid', '2026-03-15'),
(2, 1, 'Primera entrega (50 uds)', 'Produccion y entrega del primer lote', 2, 'in_progress', 1950000, 'pending', '2026-03-28'),
(3, 1, 'Segunda entrega (50 uds)', 'Produccion y entrega del segundo lote', 3, 'pending', 1950000, 'pending', '2026-04-10'),
(4, 1, 'Entrega final (50 uds)', 'Ultimo lote y cierre del contrato', 4, 'pending', 1365000, 'pending', '2026-04-20')
ON DUPLICATE KEY UPDATE
	contract_id = VALUES(contract_id),
	title = VALUES(title),
	description = VALUES(description),
	sort_order = VALUES(sort_order),
	status = VALUES(status),
	payment_amount = VALUES(payment_amount),
	payment_status = VALUES(payment_status),
	due_date = VALUES(due_date);

-- ============================================================
-- Credenciales de prueba (todas con Test1234!)
-- Negocio:
--   admin@tidyhubb.test
--   laura@lunacollection.co
--   ricardo@textilesantioquia.co
-- Compatibilidad QA:
--   admin@test.com
--   brand@test.com
--   manufacturer@test.com
-- ============================================================

-- Safety net: forzar la contraseña estandar en las cuentas de prueba
UPDATE users
SET
	password = @pwd,
	updated_at = NOW()
WHERE email IN (
	'admin@tidyhubb.test',
	'laura@lunacollection.co',
	'ricardo@textilesantioquia.co',
	'admin@test.com',
	'brand@test.com',
	'manufacturer@test.com'
);

-- 12) subscription_plans
INSERT INTO subscription_plans (id, slug, name, target_role, price_usd, max_active_projects, priority_matching, verified_badge, production_tracking, dedicated_support) VALUES
(1, 'brand_starter', 'Starter', 'brand', 29.00, 1, FALSE, FALSE, FALSE, FALSE),
(2, 'brand_scale', 'Scale', 'brand', 149.00, 4, TRUE, FALSE, TRUE, FALSE),
(3, 'brand_enterprise', 'Enterprise', 'brand', 499.00, -1, TRUE, FALSE, TRUE, TRUE),
(4, 'supplier_standard', 'Standard', 'manufacturer', 0.00, -1, FALSE, FALSE, FALSE, FALSE),
(5, 'supplier_pro', 'Pro', 'manufacturer', 99.00, -1, TRUE, TRUE, FALSE, FALSE),
(6, 'supplier_elite', 'Elite', 'manufacturer', 599.00, -1, TRUE, TRUE, FALSE, TRUE)
ON DUPLICATE KEY UPDATE
	name = VALUES(name),
	target_role = VALUES(target_role),
	price_usd = VALUES(price_usd),
	max_active_projects = VALUES(max_active_projects),
	priority_matching = VALUES(priority_matching),
	verified_badge = VALUES(verified_badge),
	production_tracking = VALUES(production_tracking),
	dedicated_support = VALUES(dedicated_support);

-- 13) subscriptions de prueba (trial de 7 dias para brands, activo para suppliers gratuitos)
INSERT INTO subscriptions (id, user_id, plan_id, status, trial_ends_at, current_period_start, current_period_end) VALUES
(1, 2, 1, 'trial', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
(2, 3, 2, 'active', NULL, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
(3, 7, 4, 'active', NULL, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
(4, 9, 5, 'active', NULL, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))
ON DUPLICATE KEY UPDATE
	plan_id = VALUES(plan_id),
	status = VALUES(status),
	trial_ends_at = VALUES(trial_ends_at),
	current_period_start = VALUES(current_period_start),
	current_period_end = VALUES(current_period_end);

-- 14) metodos de pago ficticios
INSERT INTO user_payment_methods (id, user_id, type, last_four, brand, is_default) VALUES
(1, 2, 'card', '4242', 'Visa', TRUE),
(2, 3, 'card', '5555', 'Mastercard', TRUE),
(3, 9, 'card', '1234', 'Visa', TRUE)
ON DUPLICATE KEY UPDATE
	type = VALUES(type),
	last_four = VALUES(last_four),
	brand = VALUES(brand),
	is_default = VALUES(is_default);
