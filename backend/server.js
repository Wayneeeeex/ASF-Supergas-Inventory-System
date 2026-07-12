import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/auth.js";
import stationsRouter from "./routes/stations.js";
import usersRouter from "./routes/users.js";
import productsRouter from "./routes/products.js";
import tanksRouter from "./routes/tanks.js";
import purchaseOrdersRouter from "./routes/purchaseOrders.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: (process.env.CORS_ORIGIN || "http://localhost:5174").split(",") }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/stations", stationsRouter);
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/tanks", tanksRouter);
app.use("/api/purchase-orders", purchaseOrdersRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`ASF Super Gas API running on http://localhost:${PORT}`);
});