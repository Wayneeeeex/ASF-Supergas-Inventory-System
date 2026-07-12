import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function resolveStationId(req) {
  if (req.user.role === "manager") return req.user.station_id;
  return req.query.station_id || null;
}

// GET /api/products?station_id=1&category=Lubricants&status=Low&search=oil
router.get("/", requireAuth, async (req, res) => {
  try {
    const stationId = resolveStationId(req);
    const { category, status, search } = req.query;
    const clauses = [];
    const params = [];

    if (stationId) { clauses.push("station_id = ?"); params.push(stationId); }
    if (category && category !== "all") { clauses.push("category = ?"); params.push(category); }
    if (status) { clauses.push("status = ?"); params.push(status); }
    if (search) { clauses.push("(name LIKE ? OR sku LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.query(`SELECT * FROM products ${where} ORDER BY updated_at DESC`, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/stock-by-category?station_id=1
router.get("/stock-by-category", requireAuth, async (req, res) => {
  try {
    const stationId = resolveStationId(req);
    const params = [];
    const where = stationId ? "WHERE station_id = ?" : "";
    if (stationId) params.push(stationId);

    const [rows] = await pool.query(
        `
            SELECT
                category,
                category_label AS label,
                SUM(qty) AS totalQty,
                SUM(min_qty) AS totalMin,
                MAX(CASE
                    WHEN status = 'Critical' THEN 3
                    WHEN status = 'Low' THEN 2
                    ELSE 1
                END) AS severity
            FROM products
            ${where}
            GROUP BY category, category_label
            `,
        params
    );

    const result = rows.map((r) => ({
      label: r.label,
      pct: Math.min(100, Math.round((r.totalQty / Math.max(r.totalMin, 1)) * 20)),
      tone: r.severity === 3 ? "critical" : r.severity === 2 ? "low" : "healthy",
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to aggregate stock levels" });
  }
});

// POST /api/products
router.post("/", requireAuth, async (req, res) => {
  try {
    // A manager can only create products in their own station, regardless
    // of what station_id they try to send in the body.
    const stationId = req.user.role === "manager" ? req.user.station_id : req.body.station_id;
    const { name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status } = req.body;
    const [result] = await pool.query(
        `INSERT INTO products (station_id, name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [stationId, name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id
router.put("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const [[product]] = await pool.query("SELECT station_id FROM products WHERE id = ?", [req.params.id]);
      if (!product || product.station_id !== req.user.station_id) {
        return res.status(403).json({ error: "Not your station" });
      }
    }
    const { name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status } = req.body;
    await pool.query(
        `UPDATE products SET name=?, sku=?, category=?, category_label=?, qty=?, unit=?, min_qty=?, unit_cost=?, location=?, status=?
             WHERE id=?`,
        [name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role === "manager") {
      const [[product]] = await pool.query("SELECT station_id FROM products WHERE id = ?", [req.params.id]);
      if (!product || product.station_id !== req.user.station_id) {
        return res.status(403).json({ error: "Not your station" });
      }
    }
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;