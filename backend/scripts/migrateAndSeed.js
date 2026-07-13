import bcrypt from "bcryptjs";
import { pool } from "../db.js";

async function run() {
  console.log("Initializing database tables...");
  
  // 1. Create stations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(20) NOT NULL UNIQUE,
      address VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Seed stations if empty
  const [stations] = await pool.query("SELECT COUNT(*) as count FROM stations");
  if (stations[0].count === 0) {
    await pool.query(`
      INSERT INTO stations (id, name, code, address) VALUES
      (1, 'Pantukan - Main', 'PTK-MAIN', 'Pantukan, Davao de Oro'),
      (2, 'Magdum Station', 'MAGDUM', 'Magdum, Pantukan, Davao de Oro')
    `);
    console.log("- Seeded default stations");
  }

  // 2. Create tanks table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tanks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      station_id INT NOT NULL,
      name VARCHAR(60) NOT NULL,
      volume_liters INT NOT NULL,
      capacity_liters INT NOT NULL,
      price_per_liter DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_tanks_station FOREIGN KEY (station_id) REFERENCES stations(id)
    )
  `);
  
  const [tanks] = await pool.query("SELECT COUNT(*) as count FROM tanks");
  if (tanks[0].count === 0) {
    await pool.query(`
      INSERT INTO tanks (station_id, name, volume_liters, capacity_liters, price_per_liter) VALUES
      (1, 'Unleaded 91', 12240, 18000, 60.50),
      (1, 'Unleaded 95', 3960,  18000, 65.20),
      (1, 'Diesel',      16200, 20000, 58.00),
      (1, 'LPG Bulk',    900,   10000, 45.00),
      (2, 'Unleaded 91', 9800,  15000, 60.50),
      (2, 'Unleaded 95', 6200,  15000, 65.20),
      (2, 'Diesel',      11400, 16000, 58.00),
      (2, 'LPG Bulk',    3100,  8000,  45.00)
    `);
    console.log("- Seeded default tanks");
  }

  // 3. Create products table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      station_id INT NOT NULL,
      name VARCHAR(120) NOT NULL,
      sku VARCHAR(30) NOT NULL UNIQUE,
      category VARCHAR(30) NOT NULL,
      category_label VARCHAR(40) NOT NULL,
      qty INT NOT NULL DEFAULT 0,
      unit VARCHAR(10) NOT NULL DEFAULT 'pc',
      min_qty INT NOT NULL DEFAULT 0,
      unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
      location VARCHAR(20) NOT NULL,
      status ENUM('In Stock','Low','Critical','Out of Stock') NOT NULL DEFAULT 'In Stock',
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_products_station FOREIGN KEY (station_id) REFERENCES stations(id)
    )
  `);

  const [products] = await pool.query("SELECT COUNT(*) as count FROM products");
  if (products[0].count === 0) {
    await pool.query(`
      INSERT INTO products (station_id, name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status, updated_at) VALUES
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
      (1, 'Engine Coolant Funnel Kit', 'CV-0410', 'Convenience', 'Convenience', 7, 'pc', 10, 95.00, 'E-03', 'Low', '2026-07-06'),
      (2, 'Shell Helix HX7 20W-50, 4L', 'LB-2101', 'Lubricants', 'Lubricants', 18, 'jug', 15, 975.00, 'A-01', 'In Stock', '2026-07-10'),
      (2, 'Diesel Engine Oil 15W-40, 6L', 'LB-2118', 'Lubricants', 'Lubricants', 14, 'jug', 12, 1180.00, 'A-02', 'In Stock', '2026-07-11'),
      (2, 'Oil Filter — Universal Sedan', 'FP-2044', 'Filters', 'Filters & Parts', 22, 'pc', 15, 165.00, 'B-03', 'In Stock', '2026-07-09'),
      (2, 'Air Filter — Universal', 'FP-2051', 'Filters', 'Filters & Parts', 3, 'pc', 12, 210.00, 'B-04', 'Critical', '2026-07-12'),
      (2, '11kg LPG Cylinder (Filled)', 'LPG-2112', 'Cylinders', 'LPG Cylinders', 29, 'pc', 20, 640.00, 'C-01', 'In Stock', '2026-07-11'),
      (2, 'Safety Boots — Steel Toe', 'SG-2210', 'Safety', 'Safety Gear', 6, 'pr', 10, 1450.00, 'D-02', 'Low', '2026-07-08'),
      (2, 'Fire Extinguisher 10lb ABC', 'SG-2044', 'Safety', 'Safety Gear', 5, 'pc', 6, 1850.00, 'D-01', 'Low', '2026-07-07'),
      (2, 'Bottled Water 500ml, Case', 'CV-2201', 'Convenience', 'Convenience', 31, 'case', 20, 180.00, 'E-01', 'In Stock', '2026-07-11')
    `);
    console.log("- Seeded default products");
  }

  // 4. Create purchase_orders table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      station_id INT NOT NULL,
      po_number VARCHAR(20) NOT NULL UNIQUE,
      vendor VARCHAR(120) NOT NULL,
      type VARCHAR(50) NULL,
      items VARCHAR(255) NULL,
      status ENUM('In Transit','Pending','Delayed','Delivered','Paid') NOT NULL DEFAULT 'Pending',
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      eta_date DATE NOT NULL,
      CONSTRAINT fk_po_station FOREIGN KEY (station_id) REFERENCES stations(id)
    )
  `);

  const [pos] = await pool.query("SELECT COUNT(*) as count FROM purchase_orders");
  if (pos[0].count === 0) {
    await pool.query(`
      INSERT INTO purchase_orders (station_id, po_number, vendor, type, items, status, amount, eta_date) VALUES
      (1, 'PO-4417', 'Petron Fuels Distribution',    'Bulk Fuel',   '18,000L Diesel',                  'In Transit', 210000.00, '2026-07-14'),
      (1, 'PO-4416', 'Davao Lubes & Filters Co.',    'Lubricants',  '48x Synthetic Motor Oil 1L',      'Pending',     38650.00, '2026-07-13'),
      (1, 'PO-4415', 'SafeGuard Workwear Supply',    'Safety',      '20x Safety Boots & Vests',        'Delayed',     17800.00, '2026-07-17'),
      (1, 'PO-4414', 'Isla LPG Traders Inc.',        'Cylinders',   '20x 11kg LPG Cylinders',          'Delivered',   19950.00, '2026-07-11'),
      (2, 'PO-5201', 'Davao Lubes & Filters Co.',    'Lubricants',  '30x Oil & Air Filters',           'Pending',     26400.00, '2026-07-15'),
      (2, 'PO-5202', 'SafeGuard Workwear Supply',    'Safety',      '10x Nitrile Gloves & Vests',      'In Transit',  9450.00,  '2026-07-13')
    `);
    console.log("- Seeded default purchase orders");
  }

  // 5. Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NULL DEFAULT '+63 917 555 0192',
      role ENUM('admin', 'manager', 'staff', 'purchase_order') NOT NULL DEFAULT 'staff',
      station_id INT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_users_station FOREIGN KEY (station_id) REFERENCES stations(id)
    )
  `);

  // Ensure phone column exists in case users table was already created without it
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN phone VARCHAR(20) NULL DEFAULT '+63 917 555 0192'
    `);
    console.log("- Added missing phone column to users table");
  } catch (err) {
    // Ignore if column already exists (ER_DUP_FIELDNAME)
  }

  // 6. Seed default users
  const credentials = [
    { name: "Marcus Reilly", email: "admin@asfsupergas.com", password: "changeme123", role: "admin", station_id: null },
    { name: "ASF Owner", email: "owner@asfsupergas.com", password: "owner123", role: "admin", station_id: null },
    { name: "Pantukan Manager", email: "pantukan.manager@asfsupergas.com", password: "manager123", role: "manager", station_id: 1 },
    { name: "Magdum Manager", email: "magdum.manager@asfsupergas.com", password: "manager123", role: "manager", station_id: 2 },
    { name: "PO Coordinator", email: "po@asfsupergas.com", password: "po123", role: "purchase_order", station_id: null }
  ];

  for (const cred of credentials) {
    const hash = await bcrypt.hash(cred.password, 10);
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, station_id)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name), station_id = VALUES(station_id), role = VALUES(role)
    `, [cred.name, cred.email, hash, cred.role, cred.station_id]);
    console.log(`- Seeded user: ${cred.name} (${cred.email})`);
  }

  // 7. Create transactions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(50) PRIMARY KEY,
      station_id INT NOT NULL,
      time VARCHAR(20) NOT NULL,
      type VARCHAR(60) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      liters DECIMAL(12,2) NOT NULL,
      price_per_liter DECIMAL(10,2) NOT NULL,
      date DATE NOT NULL,
      category ENUM('sales', 'delivery') NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_transactions_station FOREIGN KEY (station_id) REFERENCES stations(id)
    )
  `);

  const [txns] = await pool.query("SELECT COUNT(*) as count FROM transactions");
  if (txns[0].count === 0) {
    const today = new Date().toISOString().slice(0, 10);
    await pool.query(`
      INSERT INTO transactions (id, station_id, time, type, amount, liters, price_per_liter, date, category) VALUES
      ('TXN-8921', 1, '10:24 AM', 'Unleaded 95', 1500.00,  23.01,  65.20, ?, 'sales'),
      ('TXN-8920', 1, '10:18 AM', 'Diesel',      2100.00,  36.20,  58.00, ?, 'sales'),
      ('TXN-8919', 1, '10:05 AM', 'Unleaded 91', 500.00,   8.26,   60.50, ?, 'sales'),
      ('TXN-8918', 1, '09:42 AM', 'LPG Bulk',    950.00,   21.11,  45.00, ?, 'sales'),
      ('DEL-1001', 1, '09:00 AM', 'Diesel',      98000.00, 1690.00, 58.00, ?, 'delivery'),
      ('TXN-9921', 2, '11:15 AM', 'Unleaded 95', 2000.00,  30.67,  65.20, ?, 'sales'),
      ('TXN-9920', 2, '10:45 AM', 'Diesel',      1500.00,  25.86,  58.00, ?, 'sales'),
      ('DEL-2001', 2, '08:30 AM', 'Diesel',      58000.00, 1000.00, 58.00, ?, 'delivery')
    `, [today, today, today, today, today, today, today, today]);
    console.log("- Seeded default transactions");
  }

  console.log("Database initialized successfully!");
  process.exit(0);
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
