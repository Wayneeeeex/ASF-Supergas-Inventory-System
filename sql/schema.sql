-- ============================================================
-- ASF Super Gas — Inventory Database (multi-station)
-- Run this whole file in DBeaver (right-click connection > SQL Editor > New,
-- paste, then "Execute Script" — not just "Execute Statement").
--
-- This is a full rebuild: it drops and recreates every table.
-- If you have data you care about in the existing DB, back it up first.
-- ============================================================

CREATE DATABASE IF NOT EXISTS asf_inventory
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE asf_inventory;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- STATIONS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS stations;
CREATE TABLE stations (
                          id         INT AUTO_INCREMENT PRIMARY KEY,
                          name       VARCHAR(100) NOT NULL,
                          code       VARCHAR(20)  NOT NULL UNIQUE,
                          address    VARCHAR(255),
                          created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stations (id, name, code, address) VALUES
                                                   (1, 'Pantukan - Main', 'PTK-MAIN', 'Pantukan, Davao de Oro'),
                                                   (2, 'Magdum Station',  'MAGDUM',   'Magdum, Pantukan, Davao de Oro');

-- ------------------------------------------------------------
-- TANKS  (underground storage tank levels, per station)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS tanks;
CREATE TABLE tanks (
                       id              INT AUTO_INCREMENT PRIMARY KEY,
                       station_id      INT NOT NULL,
                       name            VARCHAR(60)  NOT NULL,
                       volume_liters   INT          NOT NULL,   -- current volume
                       capacity_liters INT          NOT NULL,   -- max capacity
                       price_per_liter DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                       updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
                       CONSTRAINT fk_tanks_station FOREIGN KEY (station_id) REFERENCES stations(id)
);

-- Pantukan - Main
INSERT INTO tanks (station_id, name, volume_liters, capacity_liters, price_per_liter) VALUES
                                                                         (1, 'Unleaded 91', 12240, 18000, 60.50),
                                                                         (1, 'Unleaded 95', 3960,  18000, 65.20),
                                                                         (1, 'Diesel',      16200, 20000, 58.00),
                                                                         (1, 'LPG Bulk',    900,   10000, 45.00);

-- Magdum Station
INSERT INTO tanks (station_id, name, volume_liters, capacity_liters, price_per_liter) VALUES
                                                                         (2, 'Unleaded 91', 9800,  15000, 60.50),
                                                                         (2, 'Unleaded 95', 6200,  15000, 65.20),
                                                                         (2, 'Diesel',      11400, 16000, 58.00),
                                                                         (2, 'LPG Bulk',    3100,  8000,  45.00);

-- ------------------------------------------------------------
-- PRODUCTS  (shop / forecourt inventory, per station)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
                          id             INT AUTO_INCREMENT PRIMARY KEY,
                          station_id     INT          NOT NULL,
                          name           VARCHAR(120) NOT NULL,
                          sku            VARCHAR(30)  NOT NULL UNIQUE,
                          category       VARCHAR(30)  NOT NULL,   -- Lubricants | Filters | Cylinders | Safety | Convenience
                          category_label VARCHAR(40)  NOT NULL,   -- display label
                          qty            INT          NOT NULL DEFAULT 0,
                          unit           VARCHAR(10)  NOT NULL DEFAULT 'pc',
                          min_qty        INT          NOT NULL DEFAULT 0,
                          unit_cost      DECIMAL(10,2) NOT NULL DEFAULT 0,
                          location       VARCHAR(20)  NOT NULL,
                          status         ENUM('In Stock','Low','Critical','Out of Stock') NOT NULL DEFAULT 'In Stock',
                          updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
                          CONSTRAINT fk_products_station FOREIGN KEY (station_id) REFERENCES stations(id)
);

-- Pantukan - Main (station_id = 1)
INSERT INTO products
(station_id, name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status, updated_at)
VALUES
    (1, 'LPG Bulk Storage', 'LPG-0001', 'Cylinders', 'LPG Cylinders', 900, 'L', 2000, 52.00, 'Tank Farm', 'Critical', '2026-07-12'),
    (1, 'Safety Boots — Steel Toe', 'SG-0210', 'Safety', 'Safety Gear', 2, 'pr', 10, 1450.00, 'D-02', 'Critical', '2026-07-09'),
    (1, 'Brake Fluid DOT 4, 1L', 'LB-0332', 'Lubricants', 'Lubricants', 4, 'btl', 12, 285.00, 'A-05', 'Critical', '2026-07-10'),
    (1, '11kg LPG Cylinder (Filled)', 'LPG-0112', 'Cylinders', 'LPG Cylinders', 64, 'pc', 20, 640.00, 'C-01', 'In Stock', '2026-07-11'),
    (1, '50kg LPG Cylinder (Filled)', 'LPG-0150', 'Cylinders', 'LPG Cylinders', 18, 'pc', 8, 2850.00, 'C-02', 'In Stock', '2026-07-11'),
    (1, 'Shell Helix HX7 20W-50, 4L', 'LB-0101', 'Lubricants', 'Lubricants', 36, 'jug', 15, 975.00, 'A-01', 'In Stock', '2026-07-08'),
    (1, 'Diesel Engine Oil 15W-40, 6L', 'LB-0118', 'Lubricants', 'Lubricants', 9, 'jug', 12, 1180.00, 'A-02', 'Low', '2026-07-11'),
    (1, 'Coolant — Green, 1L', 'LB-0340', 'Lubricants', 'Lubricants', 22, 'btl', 10, 190.00, 'A-06', 'In Stock', '2026-07-07'),
    (1, 'Oil Filter — Universal Sedan', 'FP-0044', 'Filters', 'Filters & Parts', 41, 'pc', 15, 165.00, 'B-03', 'In Stock', '2026-07-06'),
    (1, 'Air Filter — Universal', 'FP-0051', 'Filters', 'Filters & Parts', 8, 'pc', 12, 210.00, 'B-04', 'Low', '2026-07-10'),
    (1, 'Fuel Nozzle Assembly', 'FP-0009', 'Filters', 'Filters & Parts', 6, 'pc', 6, 3200.00, 'B-01', 'In Stock', '2026-07-05'),
    (1, 'Wiper Blades — 22in Universal', 'FP-0088', 'Filters', 'Filters & Parts', 0, 'pc', 10, 340.00, 'B-06', 'Out of Stock', '2026-07-04'),
    (1, 'Fire Extinguisher 10lb ABC', 'SG-0044', 'Safety', 'Safety Gear', 11, 'pc', 6, 1850.00, 'D-01', 'In Stock', '2026-07-09'),
    (1, 'Nitrile Gloves, Box of 100', 'SG-0077', 'Safety', 'Safety Gear', 14, 'bx', 8, 420.00, 'D-03', 'In Stock', '2026-07-08'),
    (1, 'Reflective Safety Vest', 'SG-0091', 'Safety', 'Safety Gear', 9, 'pc', 10, 295.00, 'D-04', 'Low', '2026-07-12'),
    (1, 'Bottled Water 500ml, Case', 'CV-0201', 'Convenience', 'Convenience', 58, 'case', 20, 180.00, 'E-01', 'In Stock', '2026-07-11'),
    (1, 'Tire Pressure Gauge', 'CV-0330', 'Convenience', 'Convenience', 12, 'pc', 8, 150.00, 'E-02', 'In Stock', '2026-07-03'),
    (1, 'Engine Coolant Funnel Kit', 'CV-0410', 'Convenience', 'Convenience', 7, 'pc', 10, 95.00, 'E-03', 'Low', '2026-07-06');

-- Magdum Station (station_id = 2)
INSERT INTO products
(station_id, name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status, updated_at)
VALUES
    (2, 'Shell Helix HX7 20W-50, 4L', 'LB-2101', 'Lubricants', 'Lubricants', 18, 'jug', 15, 975.00, 'A-01', 'In Stock', '2026-07-10'),
    (2, 'Diesel Engine Oil 15W-40, 6L', 'LB-2118', 'Lubricants', 'Lubricants', 14, 'jug', 12, 1180.00, 'A-02', 'In Stock', '2026-07-11'),
    (2, 'Oil Filter — Universal Sedan', 'FP-2044', 'Filters', 'Filters & Parts', 22, 'pc', 15, 165.00, 'B-03', 'In Stock', '2026-07-09'),
    (2, 'Air Filter — Universal', 'FP-2051', 'Filters', 'Filters & Parts', 3, 'pc', 12, 210.00, 'B-04', 'Critical', '2026-07-12'),
    (2, '11kg LPG Cylinder (Filled)', 'LPG-2112', 'Cylinders', 'LPG Cylinders', 29, 'pc', 20, 640.00, 'C-01', 'In Stock', '2026-07-11'),
    (2, 'Safety Boots — Steel Toe', 'SG-2210', 'Safety', 'Safety Gear', 6, 'pr', 10, 1450.00, 'D-02', 'Low', '2026-07-08'),
    (2, 'Fire Extinguisher 10lb ABC', 'SG-2044', 'Safety', 'Safety Gear', 5, 'pc', 6, 1850.00, 'D-01', 'Low', '2026-07-07'),
    (2, 'Bottled Water 500ml, Case', 'CV-2201', 'Convenience', 'Convenience', 31, 'case', 20, 180.00, 'E-01', 'In Stock', '2026-07-11');

-- ------------------------------------------------------------
-- PURCHASE ORDERS  (per station)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS purchase_orders;
CREATE TABLE purchase_orders (
                                 id         INT AUTO_INCREMENT PRIMARY KEY,
                                 station_id INT NOT NULL,
                                 po_number  VARCHAR(20)  NOT NULL UNIQUE,
                                 vendor     VARCHAR(120) NOT NULL,
                                 type       VARCHAR(50)  NULL,
                                 items      VARCHAR(255) NULL,
                                 status     ENUM('In Transit','Pending','Delayed','Delivered') NOT NULL DEFAULT 'Pending',
                                 amount     DECIMAL(12,2) NOT NULL DEFAULT 0,
                                 eta_date   DATE NOT NULL,
                                 CONSTRAINT fk_po_station FOREIGN KEY (station_id) REFERENCES stations(id)
);

-- Pantukan - Main
INSERT INTO purchase_orders (station_id, po_number, vendor, type, items, status, amount, eta_date) VALUES
                                                                                          (1, 'PO-4417', 'Petron Fuels Distribution',    'Bulk Fuel',   '18,000L Diesel',                  'In Transit', 210000.00, '2026-07-14'),
                                                                                          (1, 'PO-4416', 'Davao Lubes & Filters Co.',    'Lubricants',  '48x Synthetic Motor Oil 1L',      'Pending',     38650.00, '2026-07-13'),
                                                                                          (1, 'PO-4415', 'SafeGuard Workwear Supply',    'Safety',      '20x Safety Boots & Vests',        'Delayed',     17800.00, '2026-07-17'),
                                                                                          (1, 'PO-4414', 'Isla LPG Traders Inc.',        'Cylinders',   '20x 11kg LPG Cylinders',          'Delivered',   19950.00, '2026-07-11');

-- Magdum Station
INSERT INTO purchase_orders (station_id, po_number, vendor, type, items, status, amount, eta_date) VALUES
                                                                                          (2, 'PO-5201', 'Davao Lubes & Filters Co.', 'Lubricants',  '30x Oil & Air Filters',           'Pending',    26400.00, '2026-07-15'),
                                                                                          (2, 'PO-5202', 'SafeGuard Workwear Supply', 'Safety',      '10x Nitrile Gloves & Vests',      'In Transit', 9450.00,  '2026-07-13');

SET FOREIGN_KEY_CHECKS = 1;

-- Sanity check
SELECT * FROM stations;
SELECT station_id, COUNT(*) AS tank_count FROM tanks GROUP BY station_id;
SELECT station_id, COUNT(*) AS product_count FROM products GROUP BY station_id;
SELECT station_id, COUNT(*) AS po_count FROM purchase_orders GROUP BY station_id;