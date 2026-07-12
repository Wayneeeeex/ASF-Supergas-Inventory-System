import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// GET /api/users — admin only
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email, role, station_id, created_at FROM users ORDER BY id"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// POST /api/users — admin only, e.g. creating a station manager account
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const { name, email, password, role, station_id } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "name, email, password, and role are required" });
        }
        if (role === "manager" && !station_id) {
            return res.status(400).json({ error: "A station manager must be assigned a station" });
        }

        const hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, station_id) VALUES (?, ?, ?, ?, ?)`,
            [name, email, hash, role, station_id || null]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "A user with that email already exists" });
        }
        console.error(err);
        res.status(500).json({ error: "Failed to create user" });
    }
});

// PUT /api/users/:id — admin only, e.g. reassigning a manager to a different station
router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const { name, station_id, role } = req.body;
        await pool.query(
            "UPDATE users SET name = COALESCE(?, name), station_id = ?, role = COALESCE(?, role) WHERE id = ?",
            [name ?? null, station_id ?? null, role ?? null, req.params.id]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update user" });
    }
});

// DELETE /api/users/:id — admin only
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        if (Number(req.params.id) === req.user.id) {
            return res.status(400).json({ error: "You can't delete your own account" });
        }
        await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;