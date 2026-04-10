import "dotenv/config";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { generateWallet, fundTestnetWallet } from "../services/stellar.js";

const router = Router();

// GET /wrap/list — returns all wrapped APIs (id, endpoint_url, price, stellar_address, created_at)
router.get("/list", (req, res) => {
  const apis = db
    .prepare(
      `SELECT id, endpoint_url, price, stellar_address, created_at
       FROM wrapped_apis
       ORDER BY created_at DESC`
    )
    .all();
  return res.json({ count: apis.length, apis });
});

// POST /wrap — register an API URL with a price per call
router.post("/", async (req, res) => {
  const { endpointUrl, pricePerCall } = req.body;

  if (!endpointUrl || !pricePerCall) {
    return res.status(400).json({ error: "endpointUrl and pricePerCall are required" });
  }

  const price = parseFloat(pricePerCall);
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ error: "pricePerCall must be a positive number" });
  }

  try {
    new URL(endpointUrl);
  } catch {
    return res.status(400).json({ error: "endpointUrl must be a valid URL" });
  }

  try {
    const { publicKey, secretKey } = generateWallet();
    await fundTestnetWallet(publicKey);

    const id = uuidv4();
    const now = Date.now();

    db.prepare(
      `INSERT INTO wrapped_apis (id, endpoint_url, price, stellar_address, stellar_secret, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, endpointUrl, String(price), publicKey, secretKey, now);

    const wrappedEndpoint = `${process.env.BACKEND_URL}/api/proxy/${id}`;

    console.log(`[wrap] ${endpointUrl} → ${wrappedEndpoint} at ${price} USDC/call`);

    return res.json({
      success: true,
      wrappedEndpoint,
      stellarAddress: publicKey,
      pricePerCall: String(price),
    });
  } catch (err) {
    console.error("[wrap] Failed to wrap API:", err.message);
    return res.status(500).json({ error: "Failed to wrap API. Please try again." });
  }
});

export default router;
