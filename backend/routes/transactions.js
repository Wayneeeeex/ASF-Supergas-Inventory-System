import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function resolveStationId(req) {
  if (req.user.role === "manager") return req.user.station_id;
  return req.query.station_id || null;
}

// GET /api/transactions?station_id=1
router.get("/", requireAuth, async (req, res) => {
  try {
    const stationId = resolveStationId(req);
    const params = [];
    const where = stationId ? "WHERE station_id = ?" : "";
    if (stationId) params.push(stationId);

    const [rows] = await pool.query(
      `SELECT id, station_id, time, type, amount, liters, price_per_liter, DATE_FORMAT(date, '%Y-%m-%d') AS date, category FROM transactions ${where} ORDER BY date DESC, created_at DESC`,
      params
    );

    const result = rows.map((r) => ({
      id: r.id,
      station_id: r.station_id,
      time: r.time,
      type: r.type,
      amount: Number(r.amount),
      liters: Number(r.liters),
      price_per_liter: r.price_per_liter !== null ? Number(r.price_per_liter) : null,
      date: r.date,
      category: r.category,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// POST /api/transactions
router.post("/", requireAuth, async (req, res) => {
  try {
    const stationId = req.user.role === "manager" ? req.user.station_id : req.body.station_id;
    const { id, time, type, amount, liters, price_per_liter, date, category } = req.body;

    if (!id || !time || !type || amount === undefined || liters === undefined || !date || !category) {
      return res.status(400).json({ error: "Missing required transaction fields" });
    }

    if (!stationId) {
      return res.status(400).json({ error: "Station ID is required" });
    }

    await pool.query(
      `INSERT INTO transactions (id, station_id, time, type, amount, liters, price_per_liter, date, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, stationId, time, type, amount, liters, price_per_liter !== undefined ? price_per_liter : null, date, category]
    );

    res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save transaction" });
  }
});

export default router;
