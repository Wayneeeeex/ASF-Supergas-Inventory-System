USE asf_inventory;

-- Seed default users with pre-calculated bcrypt hashes
INSERT INTO users (name, email, password_hash, role, station_id) VALUES
('Marcus Reilly', 'admin@asfsupergas.com', '$2a$10$s1UJmo0WcEP/iBhz4D/w7OVIVg8Peu/IseIR.7IEaxykoywrBR3EG', 'admin', NULL),
('ASF Owner', 'owner@asfsupergas.com', '$2a$10$OQSXcpAXokSgqdGMKYmK9edFO9lpsPTyoP4wKeFqlMUDUN.yA4Gti', 'admin', NULL),
('Pantukan Manager', 'pantukan.manager@asfsupergas.com', '$2a$10$XSIbEVXGqcmLZp23Kgx1uOyPPHN/HusPUmiti2gMBwzqs4JF7S4i.', 'manager', 1),
('Magdum Manager', 'magdum.manager@asfsupergas.com', '$2a$10$XSIbEVXGqcmLZp23Kgx1uOyPPHN/HusPUmiti2gMBwzqs4JF7S4i.', 'manager', 2),
('PO Coordinator', 'po@asfsupergas.com', '$2a$10$FRrQ.p4/n3W5nUk0ht9rBuD6OOLSuajQuZ9oXfVrdCqr/olMOm4.m', 'purchase_order', NULL)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name), station_id = VALUES(station_id), role = VALUES(role);
