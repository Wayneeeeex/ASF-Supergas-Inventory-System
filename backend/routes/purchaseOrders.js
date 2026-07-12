import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/purchase-orders
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM purchase_orders ORDER BY eta_date ASC");
    const result = rows.map((po) => ({
      id: po.po_number,
      vendor: po.vendor,
      status: po.status,
      amount: `₱${Number(po.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      eta: new Date(po.eta_date).toISOString().slice(5, 10), // MM-DD
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch purchase orders" });
  }
});

// POST /api/purchase-orders
router.post("/", async (req, res) => {
  try {
    const { po_number, vendor, status, amount, eta_date } = req.body;
    const [result] = await pool.query(
      `INSERT INTO purchase_orders (po_number, vendor, status, amount, eta_date) VALUES (?, ?, ?, ?, ?)`,
      [po_number, vendor, status, amount, eta_date]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create purchase order" });
  }
});

export default router;
