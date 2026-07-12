import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Managers are hard-locked to their own station's data — their JWT already
// carries station_id from login, so there's no query param they can pass to
// override it. Admins can optionally filter with ?station_id=, or omit it
// to see everything.
function resolveStationId(req) {
  if (req.user.role === "manager") return req.user.station_id;
  return req.query.station_id || null;
}

// GET /api/tanks?station_id=1
router.get("/", requireAuth, async (req, res) => {
  try {
    const stationId = resolveStationId(req);
    const params = [];
    const where = stationId ? "WHERE station_id = ?" : "";
    if (stationId) params.push(stationId);

    const [rows] = await pool.query(`SELECT * FROM tanks ${where} ORDER BY id`, params);
    const result = rows.map((t) => {
      const pct = Math.round((t.volume_liters / t.capacity_liters) * 100);
      const status = pct <= 15 ? "critical" : pct <= 35 ? "low" : "healthy";
      return {
        id: t.id,
        station_id: t.station_id,
        name: t.name,
        pct,
        vol: `${t.volume_liters.toLocaleString()} L`,
        cap: `${t.capacity_liters.toLocaleString()} L`,
        status,
      };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tanks" });
  }
});

// PUT /api/tanks/:id
router.put("/:id", requireAuth, async (req, res) => {
  try {
    // A manager can only update a tank that actually belongs to their station
    if (req.user.role === "manager") {
      const [[tank]] = await pool.query("SELECT station_id FROM tanks WHERE id = ?", [req.params.id]);
      if (!tank || tank.station_id !== req.user.station_id) {
        return res.status(403).json({ error: "Not your station" });
      }
    }
    const { volume_liters } = req.body;
    await pool.query("UPDATE tanks SET volume_liters = ? WHERE id = ?", [volume_liters, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update tank" });
  }
});

export default router;