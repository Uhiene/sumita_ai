/**
 * Simulated AI agent for the Sumita AI demo.
 *
 * The agent has its own Stellar testnet wallet and autonomously
 * discovers, pays for, and calls x402-gated APIs.
 *
 * PRODUCTION NOTE:
 *   In a real production deployment, step 3 of agentCallAPI would:
 *     1. Parse the PAYMENT-REQUIRED header from the 402 response
 *     2. Build a real Stellar payment transaction (using TransactionBuilder)
 *     3. Sign it with the agent's secret key
 *     4. Submit it to the Stellar testnet via Horizon
 *     5. Use the confirmed transaction hash in the X-PAYMENT header
 *   This demo skips steps 2-4 and uses a prefixed fake hash so the
 *   backend proxy can identify and accept it without Horizon verification.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { encodePaymentSignatureHeader } from "@x402/core/http";
import { generateWallet, fundTestnetWallet } from "./stellar.js";
import db from "../db/database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENT_FILE = join(__dirname, "../../agent.json");
const PROXY_BASE = "http://localhost:3001/proxy";
const NETWORK = "stellar-testnet";

/**
 * Initialises the agent wallet.
 * If agent.json already exists the existing wallet is reused.
 * Otherwise a new keypair is generated and funded via Friendbot.
 *
 * @returns {Promise<{ publicKey: string, secretKey: string }>}
 */
export async function initAgent() {
  if (existsSync(AGENT_FILE)) {
    const wallet = JSON.parse(readFileSync(AGENT_FILE, "utf-8"));
    console.log(`[agent] Existing wallet loaded: ${wallet.publicKey}`);
    return wallet;
  }

  console.log("[agent] No wallet found — generating a new one...");
  const wallet = generateWallet();
  await fundTestnetWallet(wallet.publicKey);

  writeFileSync(AGENT_FILE, JSON.stringify(wallet, null, 2), "utf-8");
  console.log(`[agent] Wallet created and saved: ${wallet.publicKey}`);
  return wallet;
}

/**
 * Returns the persisted agent wallet from agent.json.
 * Throws if initAgent() has never been called.
 *
 * @returns {{ publicKey: string, secretKey: string }}
 */
export function getAgentWallet() {
  if (!existsSync(AGENT_FILE)) {
    throw new Error("Agent wallet not initialised. Call initAgent() first.");
  }
  return JSON.parse(readFileSync(AGENT_FILE, "utf-8"));
}

/**
 * Autonomously calls an x402-gated API as an AI agent.
 *
 * Flow:
 *   1. Look up the wrapped API in the database
 *   2. GET /proxy/:id — receives a 402 with payment instructions
 *   3. Generate a demo transaction hash (DEMO_TX_ prefix)
 *      In production this would be a real signed Stellar payment — see file header.
 *   4. Re-send GET /proxy/:id with the encoded X-PAYMENT header
 *   5. Return the API response with transaction metadata
 *
 * @param {string} wrappedEndpointId  UUID of the wrapped API row
 * @param {string} apiPrompt          Description of why the agent is calling (logged only)
 * @returns {Promise<{ success: boolean, txHash: string, amount: string, response: unknown }>}
 */
export async function agentCallAPI(wrappedEndpointId, apiPrompt) {
  // 1. Get API metadata from the database
  const api = db
    .prepare("SELECT * FROM wrapped_apis WHERE id = ?")
    .get(wrappedEndpointId);

  if (!api) {
    throw new Error(`Wrapped API not found: ${wrappedEndpointId}`);
  }

  const agentWallet = getAgentWallet();
  console.log(`[agent] Calling API "${api.endpoint_url}" — reason: ${apiPrompt}`);

  // 2. First request — no payment header, expect 402
  const proxyUrl = `${PROXY_BASE}/${wrappedEndpointId}`;
  const probe = await fetch(proxyUrl);

  if (probe.status !== 402) {
    // Endpoint is open — no payment needed
    const data = await probe.json();
    return { success: true, txHash: null, amount: "0", response: data };
  }

  const paymentInstructions = await probe.json();
  const requirement = paymentInstructions.accepts?.[0];
  const amount = requirement?.maxAmountRequired ?? api.price;

  console.log(
    `[agent] 402 received — payment required: ${amount} USDC to ${requirement?.payTo ?? api.stellar_address}`
  );

  // 3. Generate a demo transaction hash.
  //    PRODUCTION: replace this with a real Stellar TransactionBuilder payment — see file header.
  const txHash = `DEMO_TX_${uuidv4()}`;
  console.log(`[agent] Demo tx hash generated: ${txHash}`);

  // 4. Encode the payment payload into the X-PAYMENT header format expected by proxy.js
  const paymentPayload = {
    x402Version: 1,
    scheme: "exact",
    network: NETWORK,
    payload: {
      txHash,
      from: agentWallet.publicKey, // proxy uses this as fromAddress for demo hashes
    },
  };

  const paidResponse = await fetch(proxyUrl, {
    headers: {
      "X-PAYMENT": encodePaymentSignatureHeader(paymentPayload),
    },
  });

  if (!paidResponse.ok) {
    const err = await paidResponse.json().catch(() => ({ error: paidResponse.statusText }));
    throw new Error(`Proxy rejected payment: ${err.error ?? paidResponse.status}`);
  }

  const responseData = await paidResponse.json().catch(() => paidResponse.text());

  console.log(`[agent] Call successful — paid ${amount} USDC, tx: ${txHash}`);

  return {
    success: true,
    txHash,
    amount,
    response: responseData,
  };
}
