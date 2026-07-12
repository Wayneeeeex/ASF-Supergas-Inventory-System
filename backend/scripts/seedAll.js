import bcrypt from "bcryptjs";
import "dotenv/config";
import { pool } from "../db.js";

const credentials = [
    {
        name: "Marcus Reilly",
        email: "admin@asfsupergas.com",
        password: "changeme123",
        role: "admin",
        station_id: null
    },
    {
        name: "ASF Owner",
        email: "owner@asfsupergas.com",
        password: "owner123",
        role: "admin",
        station_id: null
    },
    {
        name: "Pantukan Manager",
        email: "pantukan.manager@asfsupergas.com",
        password: "manager123",
        role: "manager",
        station_id: 1
    },
    {
        name: "Magdum Manager",
        email: "magdum.manager@asfsupergas.com",
        password: "manager123",
        role: "manager",
        station_id: 2
    },
    {
        name: "PO Coordinator",
        email: "po@asfsupergas.com",
        password: "po123",
        role: "purchase_order",
        station_id: null
    }
];

async function run() {
    console.log("Seeding all roles and credentials...");

    for (const cred of credentials) {
        const hash = await bcrypt.hash(cred.password, 10);
        
        // Use INSERT INTO ... ON DUPLICATE KEY UPDATE to allow updates on repeat runs
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role, station_id)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name), station_id = VALUES(station_id), role = VALUES(role)`,
            [cred.name, cred.email, hash, cred.role, cred.station_id]
        );
        console.log(`- Created/Updated: ${cred.name} (${cred.email})`);
    }

    console.log("Credentials seeding complete!");
    process.exit(0);
}

run().catch((err) => {
    console.error("Failed to seed credentials:", err.message);
    process.exit(1);
});
