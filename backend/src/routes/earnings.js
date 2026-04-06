import { Router } from "express";
import db from "../db/database.js";
import bus from "../services/events.js";

const router = Router();

// Shared SSE headers — applied to every SSE response.
function setSseHeaders(res) {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Headers": "Content-Type",
    "X-Accel-Buffering": "no", // disable nginx buffering if behind a proxy
  });
  res.flushHeaders();
}

function sseWrite(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// GET /earnings — aggregate totals + last 20 transactions across all wrapped APIs
router.get("/", (req, res) => {
  const row = db
    .prepare(
      `SELECT
         COUNT(*)           AS total_calls,
         COALESCE(SUM(CAST(amount AS REAL)), 0) AS total_earned
       FROM transactions`
    )
    .get();

  const recent = db
    .prepare(
      `SELECT t.id, t.amount, t.from_address, t.tx_hash, t.created_at, t.api_id,
              w.endpoint_url
       FROM transactions t
       LEFT JOIN wrapped_apis w ON t.api_id = w.id
       ORDER BY t.created_at DESC
       LIMIT 20`
    )
    .all();

  return res.json({
    apiId: null,
    totalCalls: row.total_calls,
    totalEarned: row.total_earned.toFixed(7),
    transactions: recent,
  });
});

// GET /earnings/:apiId — summary + last 20 transactions for a specific wrapped API
router.get("/:apiId", (req, res) => {
  const { apiId } = req.params;

  const api = db.prepare("SELECT id FROM wrapped_apis WHERE id = ?").get(apiId);
  if (!api) {
    return res.status(404).json({ error: "Wrapped API not found" });
  }

  const row = db
    .prepare(
      `SELECT
         COUNT(*)           AS total_calls,
         COALESCE(SUM(CAST(amount AS REAL)), 0) AS total_earned
       FROM transactions
       WHERE api_id = ?`
    )
    .get(apiId);

  const recent = db
    .prepare(
      `SELECT id, amount, from_address, tx_hash, created_at
       FROM transactions
       WHERE api_id = ?
       ORDER BY created_at DESC
       LIMIT 20`
    )
    .all(apiId);

  return res.json({
    apiId,
    totalCalls: row.total_calls,
    totalEarned: row.total_earned.toFixed(7),
    transactions: recent,
  });
});

// GET /earnings/:apiId/live — SSE stream of new payments in real time
router.get("/:apiId/live", (req, res) => {
  const { apiId } = req.params;

  const api = db.prepare("SELECT id FROM wrapped_apis WHERE id = ?").get(apiId);
  if (!api) {
    // Can't use SSE for 404 — send a plain JSON error before flushing SSE headers
    return res.status(404).json({ error: "Wrapped API not found" });
  }

  setSseHeaders(res);

  // Send an immediate "connected" event so the client knows the stream is live
  sseWrite(res, "connected", { apiId, message: "Listening for payments..." });

  // Heartbeat every 25s to keep the connection alive through proxies/load balancers
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25_000);

  // Forward transaction events that belong to this apiId
  function onTransaction(tx) {
    if (tx.api_id !== apiId) return;
    sseWrite(res, "transaction", tx);
  }

  bus.on("transaction", onTransaction);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    bus.off("transaction", onTransaction);
    console.log(`[earnings] SSE client disconnected for ${apiId}`);
  });
});

export default router;
