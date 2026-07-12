import bcrypt from "bcryptjs";
import "dotenv/config";
import { pool } from "../db.js";

async function run() {
    console.log("Running migrations...");

    // 1. Add phone column to users table
    try {
        await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL DEFAULT '+63 917 555 0192'");
        console.log("Added phone column to users table");
    } catch (err) {
        if (err.code === "ER_DUP_COLUMN_NAME") {
            console.log("phone column already exists in users table");
        } else {
            console.error("Error adding phone column:", err.message);
        }
    }

    // 2. Add price_per_liter column to tanks table
    try {
        await pool.query("ALTER TABLE tanks ADD COLUMN price_per_liter DECIMAL(10,2) NOT NULL DEFAULT 0.00");
        console.log("Added price_per_liter column to tanks table");

        // Seed default prices for the tanks
        await pool.query("UPDATE tanks SET price_per_liter = 60.50 WHERE name = 'Unleaded 91'");
        await pool.query("UPDATE tanks SET price_per_liter = 65.20 WHERE name = 'Unleaded 95'");
        await pool.query("UPDATE tanks SET price_per_liter = 58.00 WHERE name = 'Diesel'");
        await pool.query("UPDATE tanks SET price_per_liter = 45.00 WHERE name = 'LPG Bulk'");
        console.log("Seeded tank prices successfully");
    } catch (err) {
        if (err.code === "ER_DUP_COLUMN_NAME") {
            console.log("price_per_liter column already exists in tanks table");
        } else {
            console.error("Error adding price_per_liter column:", err.message);
        }
    }

    // 3. Add type and items columns to purchase_orders table
    try {
        await pool.query("ALTER TABLE purchase_orders ADD COLUMN type VARCHAR(50) NULL");
        await pool.query("ALTER TABLE purchase_orders ADD COLUMN items VARCHAR(255) NULL");
        console.log("Added type and items columns to purchase_orders table");

        // Seed values for existing purchase orders
        await pool.query("UPDATE purchase_orders SET type = 'Bulk Fuel', items = '18,000L Diesel' WHERE po_number = 'PO-4417'");
        await pool.query("UPDATE purchase_orders SET type = 'Lubricants', items = '48x Synthetic Motor Oil 1L' WHERE po_number = 'PO-4416'");
        await pool.query("UPDATE purchase_orders SET type = 'Safety', items = '20x Safety Boots & Vests' WHERE po_number = 'PO-4415'");
        await pool.query("UPDATE purchase_orders SET type = 'Cylinders', items = '20x 11kg LPG Cylinders' WHERE po_number = 'PO-4414'");
        await pool.query("UPDATE purchase_orders SET type = 'Lubricants', items = '30x Oil & Air Filters' WHERE po_number = 'PO-5201'");
        await pool.query("UPDATE purchase_orders SET type = 'Safety', items = '10x Nitrile Gloves & Vests' WHERE po_number = 'PO-5202'");
        console.log("Seeded type and items for purchase orders successfully");
    } catch (err) {
        if (err.code === "ER_DUP_COLUMN_NAME") {
            console.log("type or items column already exists in purchase_orders table");
        } else {
            console.error("Error adding type or items column:", err.message);
        }
    }

    console.log("Migrations complete!");
    process.exit(0);
}

run().catch((err) => {
    console.error("Migration script failed:", err);
    process.exit(1);
});
