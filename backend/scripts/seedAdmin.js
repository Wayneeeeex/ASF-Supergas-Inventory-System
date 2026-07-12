// Run with: npm run seed:admin
// Optionally override via env: SEED_ADMIN_NAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
import bcrypt from "bcryptjs";
import "dotenv/config";
import { pool } from "../db.js";

const name = process.env.SEED_ADMIN_NAME || "Marcus Reilly";
const email = process.env.SEED_ADMIN_EMAIL || "admin@asfsupergas.com";
const password = process.env.SEED_ADMIN_PASSWORD || "changeme123";

async function run() {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name)`,
        [name, email, hash]
    );
    console.log(`Admin user ready.\n  email:    ${email}\n  password: ${password}`);
    console.log("Change SEED_ADMIN_PASSWORD before running this in anything but local dev.");
    process.exit(0);
}

run().catch((err) => {
    console.error("Failed to seed admin user:", err.message);
    process.exit(1);
});