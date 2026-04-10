import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db/database.js";
import wrapRoutes from "./routes/wrap.js";
import proxyRoutes from "./routes/proxy.js";
import earningsRoutes from "./routes/earnings.js";
import demoRoutes from "./routes/demo.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/wrap", wrapRoutes);
app.use("/api/proxy", proxyRoutes);
app.use("/api/earnings", earningsRoutes);
app.use("/api/demo", demoRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.path });
});

app.listen(PORT, () => {
  console.log(`Sumita AI backend running ⚡ http://localhost:${PORT}`);
});
