import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Zap, Globe, Code, Box } from "lucide-react";
import Sumita from "../components/Sumita";

// ── Code block ────────────────────────────────────────────────────────────────

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Very lightweight token colouring — highlights keys, strings, and numbers
  // without pulling in a full syntax-highlighting library.
  function colorize(raw) {
    return raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // JSON string keys
      .replace(/"([^"]+)"(?=\s*:)/g, '<span style="color:#C9B8FF">"$1"</span>')
      // String values
      .replace(/:\s*"([^"]*)"/g, ': <span style="color:#FFD6A5">"$1"</span>')
      // Numbers and booleans
      .replace(/:\s*(\d+\.?\d*|true|false|null)/g, ': <span style="color:#D4F5E9">$1</span>')
      // HTTP method keywords
      .replace(/\b(POST|GET|HTTP\/1\.1|402|200)\b/g, '<span style="color:#FFB347">$1</span>')
      // Comments
      .replace(/(\/\/[^\n]*)/g, '<span style="color:#6B6B6B;font-style:italic">$1</span>');
  }

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#1A1A2E",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: "#12122A",
          borderBottom: "1px solid #2D2D4E",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: "#6B6B6B",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {language}
        </span>
        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "1px solid #2D2D4E",
            borderRadius: 8,
            padding: "4px 10px",
            cursor: "pointer",
            color: copied ? "#D4F5E9" : "#6B6B6B",
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            transition: "all 0.15s",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <pre
        style={{
          margin: 0,
          padding: "20px 24px",
          fontFamily: "'Fira Code', 'Fira Mono', 'Cascadia Code', monospace",
          fontSize: 13,
          lineHeight: 1.75,
          color: "#CDD6F4",
          overflowX: "auto",
          whiteSpace: "pre",
        }}
        dangerouslySetInnerHTML={{ __html: colorize(code.trim()) }}
      />
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function Section({ number, title, children }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      style={{ marginBottom: 56 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#6B3FA0",
            color: "#FFFFFF",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(107,63,160,0.25)",
          }}
        >
          {number}
        </div>
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
            color: "#2D2D2D",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </motion.section>
  );
}

function Prose({ children }) {
  return (
    <p
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 16,
        color: "#6B6B6B",
        lineHeight: 1.8,
        marginBottom: 20,
      }}
    >
      {children}
    </p>
  );
}

function Step({ n, text }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          backgroundColor: "#F3EEFF",
          border: "2px solid #C9B8FF",
          color: "#6B3FA0",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {n}
      </div>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          color: "#2D2D2D",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

// ── Code samples ──────────────────────────────────────────────────────────────

const WRAP_REQUEST = `
POST http://localhost:3001/wrap
Content-Type: application/json

{
  "endpointUrl": "https://api.example.com/weather",
  "pricePerCall": "0.01"
}
`;

const WRAP_RESPONSE = `
// Response
{
  "success": true,
  "wrappedEndpoint": "http://localhost:3001/proxy/abc-123",
  "stellarAddress": "GABCDE...XYZ",
  "pricePerCall": "0.01"
}
`;

const PAYMENT_REQUIRED_RESPONSE = `
// HTTP 402 Payment Required
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "stellar-testnet",
      "maxAmountRequired": "0.01",
      "resource": "http://localhost:3001/proxy/abc-123",
      "payTo": "GABCDE...XYZ",
      "asset": "USDC",
      "maxTimeoutSeconds": 300
    }
  ],
  "error": "Payment required to access this API"
}
`;

const AGENT_CALL = `
// Agent retries with payment proof
GET http://localhost:3001/proxy/abc-123
X-PAYMENT: eyJ4NDAyVmVyc2lvbiI6MSwisc2NoZW1lIjoiZXhhY3QiLi4ufQ==

// Base64-encoded payment payload:
{
  "x402Version": 1,
  "scheme": "exact",
  "network": "stellar-testnet",
  "payload": {
    "txHash": "a1b2c3d4e5f6..."  // real Stellar transaction hash
  }
}
`;

// ── Built With badges ─────────────────────────────────────────────────────────

const BADGES = [
  { icon: Zap,   label: "Stellar",  sub: "Testnet · USDC",       bg: "#EAF4FF", color: "#1A6FA0" },
  { icon: Code,  label: "x402",     sub: "Payment Protocol",      bg: "#F3EEFF", color: "#6B3FA0" },
  { icon: Globe, label: "React",    sub: "Vite · TailwindCSS",    bg: "#E8F5FF", color: "#0EA5E9" },
  { icon: Box,   label: "Node.js",  sub: "Express · SQLite",      bg: "#EDFFF4", color: "#2D7A5A" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Docs() {
  return (
    <div style={{ backgroundColor: "#FFF8F0", minHeight: "100vh" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "60px 32px 100px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ marginBottom: 52 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 28,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <h1
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
                  color: "#2D2D2D",
                  marginBottom: 10,
                }}
              >
                Docs
              </h1>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  color: "#6B6B6B",
                  lineHeight: 1.7,
                }}
              >
                Everything you need to wrap your first API and start earning USDC on Stellar.
              </p>
            </div>
            <Sumita
              pose="point"
              size="md"
              message="Here's everything you need to know. Easy, I promise!"
              direction="left"
            />
          </div>
          <div style={{ height: 2, backgroundColor: "#FFD6E0", borderRadius: 2, marginTop: 32 }} />
        </motion.div>

        {/* ── Section 1 ── */}
        <Section number={1} title="How Sumita AI Works">
          <Prose>
            Sumita AI puts a payment gate in front of any HTTP API. When a caller hits your
            wrapped endpoint, they get a{" "}
            <strong style={{ color: "#6B3FA0" }}>402 Payment Required</strong> response
            instead of data. That response tells them exactly how much to pay and where —
            in USDC on the Stellar blockchain.
          </Prose>
          <Prose>
            Once they send the USDC and prove it with a transaction hash, Sumita forwards
            the request to your real API and returns the response. No subscriptions.
            No API keys. No invoices. Just micro-payments, per call, in seconds.
          </Prose>
          <Prose>
            The payment standard is called{" "}
            <strong style={{ color: "#6B3FA0" }}>x402</strong> — named after the HTTP
            status code that was reserved for payments in 1999 but never actually used.
            Until now.
          </Prose>
        </Section>

        {/* ── Section 2 ── */}
        <Section number={2} title="Wrap Your API">
          <Prose>
            Send a single POST request with your API URL and your price. Sumita generates
            a Stellar wallet for you, funds it on testnet, and returns a wrapped endpoint
            you can share immediately.
          </Prose>
          <div style={{ marginBottom: 16 }}>
            <CodeBlock code={WRAP_REQUEST} language="HTTP Request" />
          </div>
          <CodeBlock code={WRAP_RESPONSE} language="Response" />
        </Section>

        {/* ── Section 3 ── */}
        <Section number={3} title="How Agents Pay">
          <Prose>
            AI agents that speak x402 can autonomously discover the price, pay,
            and get the response — no human in the loop.
          </Prose>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "2px solid #FFD6E0",
              borderRadius: 16,
              padding: "24px 28px",
              marginBottom: 20,
            }}
          >
            <Step n={1} text="Agent calls your wrapped endpoint with a normal GET request." />
            <Step n={2} text="Sumita returns 402 Payment Required with the amount, currency, and your Stellar address." />
            <Step n={3} text="Agent sends the exact amount of USDC to your Stellar wallet on testnet." />
            <Step n={4} text="Agent retries the request with an X-PAYMENT header containing the transaction hash as proof." />
            <Step n={5} text="Sumita verifies the payment on-chain and forwards the request to your real API. Response delivered." />
          </div>
          <CodeBlock code={AGENT_CALL} language="Agent Request with Payment" />
        </Section>

        {/* ── Section 4 ── */}
        <Section number={4} title="The x402 Response Format">
          <Prose>
            When payment is required, Sumita returns a structured 402 body that any
            x402-compatible agent or client can parse. The{" "}
            <code
              style={{
                fontFamily: "monospace",
                backgroundColor: "#F3EEFF",
                color: "#6B3FA0",
                padding: "2px 6px",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              PAYMENT-REQUIRED
            </code>{" "}
            header carries the same payload as base64 for HTTP clients that prefer headers.
          </Prose>
          <CodeBlock code={PAYMENT_REQUIRED_RESPONSE} language="402 Payment Required" />
        </Section>

        {/* ── Section 5 ── */}
        <Section number={5} title="Built With">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
            }}
          >
            {BADGES.map(({ icon: Icon, label, sub, bg, color }) => (
              <div
                key={label}
                style={{
                  backgroundColor: bg,
                  borderRadius: 16,
                  padding: "20px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  border: `1.5px solid ${color}22`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: `${color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: color,
                      margin: 0,
                      marginBottom: 2,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      color: "#6B6B6B",
                      margin: 0,
                    }}
                  >
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}
