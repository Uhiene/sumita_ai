import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  encodePaymentRequiredHeader,
  decodePaymentSignatureHeader,
} from "@x402/core/http";
import db from "../db/database.js";
import bus from "../services/events.js";

const router = Router();
const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const NETWORK = "stellar-testnet";

// Verifies a Stellar transaction hash represents a valid USDC payment.
// Returns { valid, from } or throws with a reason string.
async function verifyStellarPayment(txHash, expectedTo, expectedAmountStr) {
  const res = await fetch(`${HORIZON_TESTNET}/transactions/${txHash}/operations`);
  if (!res.ok) {
    throw new Error(`Transaction not found on Stellar testnet (${res.status})`);
  }

  const data = await res.json();
  const ops = data._embedded?.records ?? [];

  const payment = ops.find(
    (op) =>
      op.type === "payment" &&
      op.to === expectedTo &&
      op.asset_code === "USDC" &&
      parseFloat(op.amount) >= parseFloat(expectedAmountStr)
  );

  if (!payment) {
    throw new Error(
      `No matching USDC payment found — expected ${expectedAmountStr} USDC to ${expectedTo}`
    );
  }

  return { from: payment.from };
}

// GET /proxy/:id — x402-gated proxy to wrapped API
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // 1. Look up the wrapped API
  const api = db
    .prepare("SELECT * FROM wrapped_apis WHERE id = ?")
    .get(id);

  if (!api) {
    return res.status(404).json({ error: "Wrapped API not found" });
  }

  const wrappedEndpoint = `http://localhost:3001/proxy/${id}`;

  // 2. Build the x402 PaymentRequired structure
  const paymentRequired = {
    x402Version: 1,
    accepts: [
      {
        scheme: "exact",
        network: NETWORK,
        maxAmountRequired: api.price,
        resource: wrappedEndpoint,
        description: `Pay ${api.price} USDC to call this API`,
        mimeType: "application/json",
        payTo: api.stellar_address,
        maxTimeoutSeconds: 300,
        asset: "USDC",
        extra: null,
      },
    ],
    error: "Payment required to access this API",
  };

  // 3. Check for X-PAYMENT header
  const xPaymentHeader = req.headers["x-payment"];

  if (!xPaymentHeader) {
    console.log(`[proxy] 402 — no payment for ${id}`);
    return res
      .status(402)
      .set("PAYMENT-REQUIRED", encodePaymentRequiredHeader(paymentRequired))
      .json(paymentRequired);
  }

  // 4. Decode and verify the payment
  let paymentPayload;
  try {
    paymentPayload = decodePaymentSignatureHeader(xPaymentHeader);
  } catch {
    return res.status(400).json({ error: "Invalid X-PAYMENT header encoding" });
  }

  const txHash = paymentPayload?.payload?.txHash;
  if (!txHash) {
    return res.status(400).json({ error: "X-PAYMENT payload must include payload.txHash" });
  }

  // 5. Replay protection — reject reused tx hashes
  const alreadyUsed = db
    .prepare("SELECT id FROM transactions WHERE tx_hash = ?")
    .get(txHash);

  if (alreadyUsed) {
    return res.status(400).json({ error: "Transaction already used. Each call requires a new payment." });
  }

  // 6. Verify payment on Stellar testnet.
  //    Demo hashes (DEMO_TX_ prefix) bypass Horizon verification for the agent demo.
  //    In production all hashes must be verified on-chain.
  let fromAddress;
  if (txHash.startsWith("DEMO_TX_")) {
    fromAddress = paymentPayload.payload?.from ?? "DEMO_AGENT";
    console.log(`[proxy] Demo payment accepted for ${id} from ${fromAddress}`);
  } else {
    try {
      ({ from: fromAddress } = await verifyStellarPayment(
        txHash,
        api.stellar_address,
        api.price
      ));
    } catch (err) {
      console.error(`[proxy] Payment verification failed for ${id}:`, err.message);
      return res.status(402).json({ error: err.message, ...paymentRequired });
    }
  }

  // 7. Forward request to the original endpoint
  let upstreamRes;
  try {
    upstreamRes = await fetch(api.endpoint_url, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`[proxy] Upstream request failed for ${id}:`, err.message);
    return res.status(502).json({ error: "Upstream API request failed" });
  }

  // 8. Log the successful transaction
  const txId = uuidv4();
  db.prepare(
    `INSERT INTO transactions (id, api_id, amount, from_address, tx_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(txId, id, api.price, fromAddress, txHash, Date.now());

  console.log(`[proxy] ✓ Payment verified — ${api.price} USDC from ${fromAddress} for ${id}`);
  bus.emit("transaction", { id: txId, api_id: id, amount: api.price, from_address: fromAddress, tx_hash: txHash, created_at: Date.now() });

  // 9. Return upstream response
  const upstreamBody = await upstreamRes.text();
  return res
    .status(upstreamRes.status)
    .set("Content-Type", upstreamRes.headers.get("content-type") ?? "application/json")
    .send(upstreamBody);
});

export default router;
