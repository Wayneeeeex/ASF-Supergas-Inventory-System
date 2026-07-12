-- ============================================================
-- ASF Super Gas — Inventory Database
-- Run this whole file in DBeaver (right-click connection > SQL Editor > New,
-- paste, then "Execute Script" — not just "Execute Statement").
-- ============================================================

CREATE DATABASE IF NOT EXISTS asf_inventory
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE asf_inventory;

-- ------------------------------------------------------------
-- TANKS  (underground storage tank levels)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS tanks;
CREATE TABLE tanks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL,
  volume_liters INT          NOT NULL,   -- current volume
  capacity_liters INT        NOT NULL,   -- max capacity
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO tanks (name, volume_liters, capacity_liters) VALUES
  ('Unleaded 91', 12240, 18000),
  ('Unleaded 95', 3960,  18000),
  ('Diesel',      16200, 20000),
  ('LPG Bulk',    900,   10000);

-- ------------------------------------------------------------
-- PRODUCTS  (shop / forecourt inventory)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  sku           VARCHAR(30)  NOT NULL UNIQUE,
  category      VARCHAR(30)  NOT NULL,   -- Lubricants | Filters | Cylinders | Safety | Convenience
  category_label VARCHAR(40) NOT NULL,   -- display label
  qty           INT          NOT NULL DEFAULT 0,
  unit          VARCHAR(10)  NOT NULL DEFAULT 'pc',
  min_qty       INT          NOT NULL DEFAULT 0,
  unit_cost     DECIMAL(10,2) NOT NULL DEFAULT 0,
  location      VARCHAR(20)  NOT NULL,
  status        ENUM('In Stock','Low','Critical','Out of Stock') NOT NULL DEFAULT 'In Stock',
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO products
  (name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status, updated_at)
VALUES
  ('LPG Bulk Storage', 'LPG-0001', 'Cylinders', 'LPG Cylinders', 900, 'L', 2000, 52.00, 'Tank Farm', 'Critical', '2026-07-12'),
  ('Safety Boots — Steel Toe', 'SG-0210', 'Safety', 'Safety Gear', 2, 'pr', 10, 1450.00, 'D-02', 'Critical', '2026-07-09'),
  ('Brake Fluid DOT 4, 1L', 'LB-0332', 'Lubricants', 'Lubricants', 4, 'btl', 12, 285.00, 'A-05', 'Critical', '2026-07-10'),
  ('11kg LPG Cylinder (Filled)', 'LPG-0112', 'Cylinders', 'LPG Cylinders', 64, 'pc', 20, 640.00, 'C-01', 'In Stock', '2026-07-11'),
  ('50kg LPG Cylinder (Filled)', 'LPG-0150', 'Cylinders', 'LPG Cylinders', 18, 'pc', 8, 2850.00, 'C-02', 'In Stock', '2026-07-11'),
  ('Shell Helix HX7 20W-50, 4L', 'LB-0101', 'Lubricants', 'Lubricants', 36, 'jug', 15, 975.00, 'A-01', 'In Stock', '2026-07-08'),
  ('Diesel Engine Oil 15W-40, 6L', 'LB-0118', 'Lubricants', 'Lubricants', 9, 'jug', 12, 1180.00, 'A-02', 'Low', '2026-07-11'),
  ('Coolant — Green, 1L', 'LB-0340', 'Lubricants', 'Lubricants', 22, 'btl', 10, 190.00, 'A-06', 'In Stock', '2026-07-07'),
  ('Oil Filter — Universal Sedan', 'FP-0044', 'Filters', 'Filters & Parts', 41, 'pc', 15, 165.00, 'B-03', 'In Stock', '2026-07-06'),
  ('Air Filter — Universal', 'FP-0051', 'Filters', 'Filters & Parts', 8, 'pc', 12, 210.00, 'B-04', 'Low', '2026-07-10'),
  ('Fuel Nozzle Assembly', 'FP-0009', 'Filters', 'Filters & Parts', 6, 'pc', 6, 3200.00, 'B-01', 'In Stock', '2026-07-05'),
  ('Wiper Blades — 22in Universal', 'FP-0088', 'Filters', 'Filters & Parts', 0, 'pc', 10, 340.00, 'B-06', 'Out of Stock', '2026-07-04'),
  ('Fire Extinguisher 10lb ABC', 'SG-0044', 'Safety', 'Safety Gear', 11, 'pc', 6, 1850.00, 'D-01', 'In Stock', '2026-07-09'),
  ('Nitrile Gloves, Box of 100', 'SG-0077', 'Safety', 'Safety Gear', 14, 'bx', 8, 420.00, 'D-03', 'In Stock', '2026-07-08'),
  ('Reflective Safety Vest', 'SG-0091', 'Safety', 'Safety Gear', 9, 'pc', 10, 295.00, 'D-04', 'Low', '2026-07-12'),
  ('Bottled Water 500ml, Case', 'CV-0201', 'Convenience', 'Convenience', 58, 'case', 20, 180.00, 'E-01', 'In Stock', '2026-07-11'),
  ('Tire Pressure Gauge', 'CV-0330', 'Convenience', 'Convenience', 12, 'pc', 8, 150.00, 'E-02', 'In Stock', '2026-07-03'),
  ('Engine Coolant Funnel Kit', 'CV-0410', 'Convenience', 'Convenience', 7, 'pc', 10, 95.00, 'E-03', 'Low', '2026-07-06');

-- ------------------------------------------------------------
-- PURCHASE ORDERS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS purchase_orders;
CREATE TABLE purchase_orders (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  po_number   VARCHAR(20)  NOT NULL UNIQUE,
  vendor      VARCHAR(120) NOT NULL,
  status      ENUM('In Transit','Pending','Delayed','Delivered') NOT NULL DEFAULT 'Pending',
  amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
  eta_date    DATE NOT NULL
);

INSERT INTO purchase_orders (po_number, vendor, status, amount, eta_date) VALUES
  ('PO-4417', 'Petron Fuels Distribution',    'In Transit', 210000.00, '2026-07-14'),
  ('PO-4416', 'Davao Lubes & Filters Co.',    'Pending',     38650.00, '2026-07-13'),
  ('PO-4415', 'SafeGuard Workwear Supply',    'Delayed',     17800.00, '2026-07-17'),
  ('PO-4414', 'Isla LPG Traders Inc.',        'Delivered',   19950.00, '2026-07-11');

-- Quick sanity check
SELECT * FROM tanks;
SELECT * FROM products;
SELECT * FROM purchase_orders;
