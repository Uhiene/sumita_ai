# Sumita AI

**The payment layer the internet was missing.**

Sumita AI wraps any existing API with a Stellar micropayment layer using the x402 protocol. Developers earn USDC per API call automatically — no blockchain knowledge required.

## Stack

**Frontend:** React + Vite + TailwindCSS + Framer Motion + Recharts + React Router  
**Backend:** Node.js + Express + @x402/express + @stellar/stellar-sdk + better-sqlite3  
**Blockchain:** Stellar Testnet · USDC · x402 protocol

## Setup

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## Network

Stellar Testnet only. Never real money.
