// Apply after requireAuth, e.g.:
//   router.post("/", requireAuth, requireRole("admin"), handler)
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "You don't have permission to do that" });
        }
        next();
    };
}