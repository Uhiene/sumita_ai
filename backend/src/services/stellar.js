import { Keypair, Horizon, Asset } from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const FRIENDBOT_URL = "https://friendbot.stellar.org";

// USDC issued by Circle on Stellar testnet
const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const USDC = new Asset("USDC", USDC_ISSUER);

const server = new Horizon.Server(HORIZON_URL);

/**
 * Generates a new Stellar keypair.
 * @returns {{ publicKey: string, secretKey: string }}
 */
export function generateWallet() {
  const keypair = Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

/**
 * Funds a testnet wallet using Stellar Friendbot.
 * Friendbot funds accounts with XLM so they can transact.
 * @param {string} publicKey
 * @returns {Promise<boolean>} true on success
 */
export async function fundTestnetWallet(publicKey) {
  try {
    const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Friendbot returned ${res.status}: ${body}`);
    }
    console.log(`[stellar] Funded testnet wallet: ${publicKey}`);
    return true;
  } catch (err) {
    console.error(`[stellar] fundTestnetWallet failed for ${publicKey}:`, err.message);
    throw err;
  }
}

/**
 * Returns the USDC balance of a wallet on Stellar testnet.
 * Returns "0" if the wallet has no USDC trustline yet.
 * @param {string} publicKey
 * @returns {Promise<string>} USDC balance as a string (e.g. "1.5000000")
 */
export async function getBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    const usdcBalance = account.balances.find(
      (b) =>
        b.asset_type === "credit_alphanum4" &&
        b.asset_code === USDC.getCode() &&
        b.asset_issuer === USDC.getIssuer()
    );
    const balance = usdcBalance ? usdcBalance.balance : "0";
    console.log(`[stellar] USDC balance for ${publicKey}: ${balance}`);
    return balance;
  } catch (err) {
    if (err.response?.status === 404) {
      console.warn(`[stellar] Account not found (unfunded): ${publicKey}`);
      return "0";
    }
    console.error(`[stellar] getBalance failed for ${publicKey}:`, err.message);
    throw err;
  }
}
