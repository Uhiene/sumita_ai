import { Router } from "express";
import { agentCallAPI, initAgent, getAgentWallet } from "../services/agent.js";

const router = Router();
const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";

// Returns the XLM balance for a given public key from Horizon.
// XLM is the native asset — its balance_type is "native" in the Horizon response.
async function getXLMBalance(publicKey) {
  try {
    const res = await fetch(`${HORIZON_TESTNET}/accounts/${publicKey}`);
    if (!res.ok) return "0";
    const data = await res.json();
    const native = data.balances?.find((b) => b.asset_type === "native");
    return native?.balance ?? "0";
  } catch {
    return "0";
  }
}

// POST /api/demo/run — agent autonomously calls a wrapped API and pays for it
router.post("/run", async (req, res) => {
  const { apiId, prompt } = req.body;

  if (!apiId) {
    return res.status(400).json({ error: "apiId is required" });
  }

  // Lazy-initialise agent wallet on first call
  try {
    getAgentWallet();
  } catch {
    await initAgent();
  }

  try {
    const result = await agentCallAPI(apiId, prompt ?? "Agent API call");
    return res.json({
      success: true,
      txHash: result.txHash,
      amount: result.amount,
      response: result.response,
    });
  } catch (err) {
    console.error("[demo] agentCallAPI failed:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/demo/agent — returns the agent's public key and current XLM balance
router.get("/agent", async (req, res) => {
  let wallet;
  try {
    wallet = getAgentWallet();
  } catch {
    // No agent yet — initialise on demand
    wallet = await initAgent();
  }

  const xlmBalance = await getXLMBalance(wallet.publicKey);

  return res.json({
    publicKey: wallet.publicKey,
    xlmBalance,
    network: "stellar-testnet",
  });
});

export default router;
