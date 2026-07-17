import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/products?category=Lubricants&status=Low&search=oil
router.get("/", async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const clauses = [];
    const params = [];

    if (category && category !== "all") {
      clauses.push("category = ?");
      params.push(category);
    }
    if (status) {
      clauses.push("status = ?");
      params.push(status);
    }
    if (search) {
      clauses.push("(name LIKE ? OR sku LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `SELECT * FROM products ${where} ORDER BY updated_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/stock-by-category
// Aggregates qty vs min_qty per category for the bar chart, and derives
// a "tone" (healthy/low/critical) from the worst status present.
router.get("/stock-by-category", async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
      GROUP BY category, category_label
    `);

    const result = rows.map((r) => ({
      label: r.label,
      pct: Math.min(100, Math.round((r.totalQty / Math.max(r.totalMin, 1)) * 20)),
      tone: r.severity === 3 ? "critical" : r.severity === 2 ? "low" : "healthy",
    }));

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to aggregate stock levels" });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const { name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status } = req.body;
    const [result] = await pool.query(
      `INSERT INTO products (name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  try {
    const { name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status } = req.body;
    await pool.query(
      `UPDATE products SET name=?, sku=?, category=?, category_label=?, qty=?, unit=?, min_qty=?, unit_cost=?, location=?, status=?
       WHERE id=?`,
      [name, sku, category, category_label, qty, unit, min_qty, unit_cost, location, status, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
