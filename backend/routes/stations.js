import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// GET /api/stations
// Admins see every station plus who manages it. Managers only ever get
// their own single station back — enforced here, not just hidden in the UI,
// so hitting this endpoint directly can't leak other stations' existence.
router.get("/", requireAuth, async (req, res) => {
    try {
        const [stations] = await pool.query("SELECT * FROM stations ORDER BY id");
        const [managers] = await pool.query(
            "SELECT id, name, email, station_id FROM users WHERE role = 'manager'"
        );

        const result = stations.map((s) => ({
            ...s,
            manager: managers.find((m) => m.station_id === s.id) || null,
        }));

        if (req.user.role === "manager") {
            return res.json(result.filter((s) => s.id === req.user.station_id));
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch stations" });
    }
});

// POST /api/stations
router.post("/", requireAuth, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can add branches" });
    }
    const { name, code, address } = req.body;
    if (!name || !code) {
        return res.status(400).json({ error: "Name and code are required" });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(
            "INSERT INTO stations (name, code, address) VALUES (?, ?, ?)",
            [name, code, address || null]
        );
        const stationId = result.insertId;

        // Auto-create standard tanks: name, initial volume, capacity, initial price
        const defaultTanks = [
            ["Unleaded 91", 0, 18000, 60.50],
            ["Unleaded 95", 0, 18000, 65.20],
            ["Diesel", 0, 20000, 58.00],
            ["LPG Bulk", 0, 10000, 45.00]
        ];

        for (const [tankName, vol, cap, price] of defaultTanks) {
            await connection.query(
                "INSERT INTO tanks (station_id, name, volume_liters, capacity_liters, price_per_liter) VALUES (?, ?, ?, ?, ?)",
                [stationId, tankName, vol, cap, price]
            );
        }

        await connection.commit();
        res.status(201).json({ id: stationId, name, code, address });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: "Failed to create station" });
    } finally {
        connection.release();
    }
});

export default router;