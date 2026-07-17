import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/tanks — computes % full and status band from raw volumes,
// so the DB only ever stores the real numbers.
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tanks ORDER BY id");
    const result = rows.map((t) => {
      const pct = Math.round((t.volume_liters / t.capacity_liters) * 100);
      const status = pct <= 15 ? "critical" : pct <= 35 ? "low" : "healthy";
      return {
        id: t.id,
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

// PUT /api/tanks/:id  — update a reading (e.g. after a delivery or dip test)
router.put("/:id", async (req, res) => {
  try {
    const { volume_liters } = req.body;
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid tank ID" });
    }

    if (typeof volume_liters !== "number" || isNaN(volume_liters) || volume_liters < 0) {
      return res.status(400).json({ error: "Invalid volume_liters" });
    }

    await pool.query("UPDATE tanks SET volume_liters = ? WHERE id = ?", [volume_liters, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update tank" });
  }
});

export default router;
