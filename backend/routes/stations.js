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

export default router;