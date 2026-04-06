# Sumita AI

### "The payment layer the internet was missing."

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7B68EE?style=flat-square&logo=stellar&logoColor=white)](https://stellar.org)
[![x402](https://img.shields.io/badge/Protocol-x402-C9B8FF?style=flat-square)](https://github.com/coinbase/x402)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-FFD700?style=flat-square)](LICENSE)

---

## What is Sumita AI?

Sumita AI lets any developer wrap their existing HTTP API with a Stellar micropayment layer in under 5 minutes — no blockchain knowledge required. Every API call automatically earns the developer USDC on Stellar testnet, with no code changes to the original API.

Built for the era of autonomous AI agents, Sumita AI implements the [x402 protocol](https://github.com/coinbase/x402), allowing AI agents to discover, pay for, and consume APIs without any human in the loop.

---

## The Problem

APIs are the backbone of the internet, but monetising them is painful. Stripe requires signups, API keys, monthly billing cycles, and chargebacks. For AI agents that need to call thousands of APIs autonomously, this is a complete non-starter.

There is no native way for a machine to pay another machine per API call — until now.

---

## How It Works

1. **Paste your API URL** — enter any public HTTP endpoint and set a price in USDC
2. **Get a wrapped endpoint** — Sumita AI generates a Stellar wallet and a payment-gated proxy URL
3. **Share the endpoint** — anyone (or any AI agent) can call your wrapped URL
4. **Agent hits a 402** — the proxy returns HTTP 402 Payment Required with Stellar payment details
5. **Agent pays on Stellar** — the x402 protocol encodes a micropayment in the request header
6. **You earn USDC** — the proxy verifies payment, forwards the request, logs the transaction

No signup. No monthly fee. No chargebacks. Pure pay-per-call on Stellar.

---

## Demo

> **[Demo video link here]**

### Screenshots

> **[Screenshots here]**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Payment Protocol | [x402](https://github.com/coinbase/x402) over HTTP |
| Blockchain | [Stellar Testnet](https://stellar.org) — USDC micropayments |
| Backend | Node.js, Express, better-sqlite3 |
| Frontend | React (Vite), Framer Motion, Recharts, TailwindCSS |
| Wallet SDK | [@stellar/stellar-sdk](https://github.com/stellar/js-stellar-sdk) |

---

## How It Uses Stellar

- **Wallet generation** — every wrapped API gets a dedicated Stellar keypair funded via Friendbot on testnet
- **x402 protocol** — the proxy issues HTTP 402 responses containing Stellar payment requirements; clients encode payment in the `X-PAYMENT` request header using `@x402/core`
- **USDC on Stellar** — payments are denominated in USDC issued by Circle on the Stellar testnet
- **AI agent payments** — the built-in demo agent autonomously generates a Stellar wallet, receives XLM via Friendbot, and signs payment transactions without any human interaction
- **Real-time earnings** — every confirmed payment is stored locally and surfaced in the live dashboard

> View live transactions on Stellar Expert:
> **[https://stellar.expert/explorer/testnet/account/YOUR_WALLET_ADDRESS](https://stellar.expert/explorer/testnet)**

---

## Running Locally

### Prerequisites

- Node.js 20+
- npm 9+

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/sumita-ai.git
cd sumita-ai
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Set up environment files

**backend/.env**
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_FRIENDBOT_URL=https://friendbot.stellar.org
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3001
```

### 4. Start the backend

```bash
cd backend
npm start
```

You should see:
```
Sumita AI backend is running on port 3001
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Testing End-to-End

1. Go to `/wrap` — enter any public API URL (e.g. `https://httpbin.org/json`), set a price, click **Generate**
2. Copy the API ID from the wrapped endpoint URL
3. Go to `/demo` — paste the API ID and click **Run Agent**
4. Watch the AI agent autonomously pay for and consume the API across 5 animated steps
5. Go to `/dashboard` — see the transaction and USDC earned in real time

---

## Project Structure

```
sumita-ai/
├── backend/
│   ├── src/
│   │   ├── routes/         # wrap, proxy, earnings, demo
│   │   ├── services/       # stellar, agent, events
│   │   └── db/             # SQLite schema
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/     # Sumita, TransactionFeed, EarningsChart, Navbar
│   │   ├── pages/          # Landing, Wrap, Dashboard, AgentDemo, Docs
│   │   ├── hooks/          # useResponsive
│   │   └── lib/            # api.js — centralised fetch layer
│   └── .env
└── README.md
```

---

## Built For

**Agents on Stellar Hackathon 2026**

Sumita AI demonstrates how the x402 protocol and Stellar micropayments can create a native monetisation layer for the agentic web — where AI agents pay for APIs the same way humans pay for goods: instantly, autonomously, and without friction.

---

## License

MIT — see [LICENSE](LICENSE)

---

*Built with love by the Sumita AI team.*
