import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function resolveStationId(req) {
  if (req.user.role === "manager") return req.user.station_id;
  return req.query.station_id || null;
}

// GET /api/purchase-orders?station_id=1
router.get("/", requireAuth, async (req, res) => {
  try {
    const stationId = resolveStationId(req);
    const params = [];
    const where = stationId ? "WHERE station_id = ?" : "";
    if (stationId) params.push(stationId);

    const [rows] = await pool.query(`SELECT * FROM purchase_orders ${where} ORDER BY eta_date ASC`, params);
    const result = rows.map((po) => ({
      id: po.po_number,
      station_id: po.station_id,
      vendor: po.vendor,
      status: po.status,
      type: po.type,
      items: po.items,
      amount: `₱${Number(po.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      eta: new Date(po.eta_date).toISOString().slice(5, 10),
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch purchase orders" });
  }
});

// POST /api/purchase-orders
router.post("/", requireAuth, async (req, res) => {
  try {
    const stationId = req.user.role === "manager" ? req.user.station_id : req.body.station_id;
    const { po_number, vendor, status, amount, eta_date, type, items } = req.body;
    const [result] = await pool.query(
        `INSERT INTO purchase_orders (station_id, po_number, vendor, status, amount, eta_date, type, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [stationId, po_number, vendor, status || 'Pending', amount, eta_date, type || null, items || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create purchase order" });
  }
});

export default router;