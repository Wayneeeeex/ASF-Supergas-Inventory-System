import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Apply to any route that should require a logged-in user, e.g.:
//   router.get("/", requireAuth, async (req, res) => { ... req.user is available ... });
export function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Authentication required" });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}