import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

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
            phone: user.phone,
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

// PUT /api/auth/profile — updates currently logged-in user profile & password
router.put("/profile", requireAuth, async (req, res) => {
    try {
        const { name, email, phone, currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Fetch current user details from DB
        const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
        const user = rows[0];
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // If they want to change their password
        let newPasswordHash = null;
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Current password is required to change password" });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: "Incorrect current password" });
            }
            newPasswordHash = await bcrypt.hash(newPassword, 10);
        }

        // Run the update
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push("name = ?");
            params.push(name);
        }
        if (email !== undefined) {
            updates.push("email = ?");
            params.push(email);
        }
        if (phone !== undefined) {
            updates.push("phone = ?");
            params.push(phone);
        }
        if (newPasswordHash) {
            updates.push("password_hash = ?");
            params.push(newPasswordHash);
        }

        if (updates.length > 0) {
            params.push(userId);
            await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
        }

        // Fetch updated user to sign new token
        const [updatedRows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
        const updatedUser = updatedRows[0];

        const payload = {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            station_id: updatedUser.station_id,
            phone: updatedUser.phone,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
        res.json({ token, user: payload });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Email already taken" });
        }
        res.status(500).json({ error: "Failed to update profile" });
    }
});

export default router;