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

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/wrap", wrapRoutes);
app.use("/proxy", proxyRoutes);
app.use("/earnings", earningsRoutes);
app.use("/api/demo", demoRoutes); // /api prefix per spec; other routes use no prefix

app.listen(PORT, () => {
  console.log(`Sumita AI backend running ⚡ http://localhost:${PORT}`);
});
