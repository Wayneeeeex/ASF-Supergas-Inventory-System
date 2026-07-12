import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0];

        // Same generic error whether the email doesn't exist or the password is
        // wrong — don't reveal which, that just helps someone enumerate accounts.
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            station_id: user.station_id,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
        res.json({ token, user: payload });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});

// GET /api/auth/me — used on app load to check if a stored token is still valid
router.get("/me", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        res.json({ user: payload });
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
});

export default router;