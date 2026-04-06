import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Wallet,
  Zap,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Unlock,
  ChevronRight,
  Play,
} from "lucide-react";
import Sumita from "../components/Sumita";
import TransactionFeed from "../components/TransactionFeed";
import { useResponsive } from "../hooks/useResponsive";
import { getAgentWallet, runAgentDemo } from "../lib/api";

const STEP_DELAY_MS = 800;

// The 5 narrative steps shown during a demo run
const STEPS = [
  { icon: Bot,         label: "Agent called the endpoint" },
  { icon: AlertCircle, label: "Received 402 Payment Required" },
  { icon: CreditCard,  label: null }, // label is dynamic (includes amount)
  { icon: CheckCircle, label: null }, // label is dynamic (includes txHash)
  { icon: Unlock,      label: "API unlocked! Response received." },
];

const STEP_COLORS = ["#6B3FA0", "#FFB347", "#C9B8FF", "#4CAF50", "#4CAF50"];

function truncate(str, len = 20) {
  if (!str) return "—";
  if (str.length <= len) return str;
  return `${str.slice(0, 10)}...${str.slice(-6)}`;
}

function AgentWalletCard({ agent }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "2px solid #FFD6E0",
        borderRadius: 20,
        padding: "20px 24px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          backgroundColor: "#F3EEFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Wallet size={20} color="#6B3FA0" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "#6B6B6B",
            margin: 0,
            marginBottom: 2,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Agent Wallet · Stellar Testnet
        </p>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            color: "#2D2D2D",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {agent.publicKey}
        </p>
      </div>
      <div
        style={{
          backgroundColor: "#D4F5E9",
          borderRadius: 12,
          padding: "8px 14px",
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: "#2D7A5A",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          XLM Balance
        </p>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#2D7A5A",
            margin: 0,
          }}
        >
          {parseFloat(agent.xlmBalance).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function StepRow({ step, index, result }) {
  const Icon = step.icon;
  const color = STEP_COLORS[index];

  let label = step.label;
  if (index === 2 && result) label = `Paying ${result.amount} USDC on Stellar...`;
  if (index === 3 && result) label = `Transaction confirmed: ${truncate(result.txHash, 24)}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        backgroundColor: "#FFFFFF",
        border: `1.5px solid ${color}22`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={15} color={color} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: "#6B6B6B",
            fontWeight: 500,
          }}
        >
          Step {index + 1}
        </span>
        <ChevronRight size={12} color="#C9B8FF" />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: "#2D2D2D",
          }}
        >
          {label}
        </span>
      </div>
    </motion.div>
  );
}

export default function AgentDemo() {
  const { isMobile } = useResponsive();
  const [agent, setAgent]       = useState(null);
  const [agentError, setAgentError] = useState(null);
  const [apiId, setApiId]       = useState("");
  const [status, setStatus]     = useState("idle"); // idle | running | done | error
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [result, setResult]     = useState(null);
  const [runError, setRunError] = useState(null);

  // Fetch agent wallet on mount
  useEffect(() => {
    getAgentWallet()
      .then(setAgent)
      .catch((err) => setAgentError(err.message));
  }, []);

  async function runDemo() {
    if (!apiId.trim()) return;

    setStatus("running");
    setVisibleSteps([]);
    setResult(null);
    setRunError(null);

    // Step 1 appears immediately
    setVisibleSteps([0]);

    // Kick off the backend call right away — steps are cosmetic animation
    const fetchPromise = runAgentDemo(apiId.trim(), "AgentDemo UI call");

    // Reveal steps 2–4 on a timer while the request is in flight
    for (let i = 1; i <= 3; i++) {
      await new Promise((r) => setTimeout(r, STEP_DELAY_MS));
      setVisibleSteps((prev) => [...prev, i]);
    }

    // Await result (should be done by now but guard either way)
    let data;
    try {
      data = await fetchPromise;
    } catch (err) {
      setRunError(err.message);
      setStatus("error");
      return;
    }

    if (!data.success) {
      setRunError(data.error ?? "Unknown error");
      setStatus("error");
      return;
    }

    setResult(data);

    // Step 5 after final delay
    await new Promise((r) => setTimeout(r, STEP_DELAY_MS));
    setVisibleSteps([0, 1, 2, 3, 4]);
    setStatus("done");
  }

  const inputStyle = {
    flex: 1,
    padding: "12px 16px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
    color: "#2D2D2D",
    backgroundColor: "#FFFFFF",
    border: "1.5px solid #FFD6E0",
    borderRadius: 12,
    outline: "none",
    minWidth: 0,
    boxSizing: "border-box",
  };

  const sumitaPose  = status === "done" ? "celebrate" : status === "running" ? "think" : "wave";
  const sumitaMsg =
    status === "done"
      ? "Cha-ching! Payment received on Stellar. Your wallet just got heavier!"
      : status === "running"
      ? "Hang tight... I'm talking to the Stellar network. These things take like 4 seconds tops!"
      : "Hey! Paste an API ID below and I'll show you what autonomous payments look like.";

  return (
    <div style={{ backgroundColor: "#FFF8F0", minHeight: "100vh", padding: isMobile ? "40px 16px" : "60px 32px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
              color: "#2D2D2D",
              marginBottom: 10,
            }}
          >
            Watch Sumita AI in Action
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              color: "#6B6B6B",
              maxWidth: 580,
              lineHeight: 1.6,
            }}
          >
            See an AI agent autonomously discover, pay for, and consume an API — all on Stellar testnet.
          </p>
        </div>

        {/* Agent wallet */}
        {agentError ? (
          <div
            style={{
              backgroundColor: "#FFE0E0",
              borderRadius: 16,
              padding: "14px 18px",
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: "#B33A3A",
              marginBottom: 28,
            }}
          >
            Could not load agent wallet: {agentError}
          </div>
        ) : agent ? (
          <div style={{ marginBottom: 28 }}>
            <AgentWalletCard agent={agent} />
          </div>
        ) : (
          <div
            style={{
              height: 80,
              backgroundColor: "#F3EEFF",
              borderRadius: 20,
              marginBottom: 28,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        )}

        {/* Demo control card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "2px solid #FFD6E0",
            borderRadius: 20,
            padding: "32px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            marginBottom: 40,
          }}
        >
          {/* Sumita */}
          <div style={{ marginBottom: 28 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={sumitaPose + status}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <Sumita pose={sumitaPose} message={sumitaMsg} size="md" direction="right" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Input row */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Paste a wrapped API ID"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              disabled={status === "running"}
              style={{
                ...inputStyle,
                opacity: status === "running" ? 0.6 : 1,
              }}
            />
            <motion.button
              onClick={runDemo}
              disabled={status === "running" || !apiId.trim()}
              whileHover={{ scale: status === "running" || !apiId.trim() ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                backgroundColor:
                  status === "running" || !apiId.trim() ? "#E0D6FF" : "#6B3FA0",
                color: "#FFFFFF",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: "12px 24px",
                borderRadius: 12,
                border: "none",
                cursor: status === "running" || !apiId.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                flexShrink: 0,
                minHeight: 44,
                width: isMobile ? "100%" : "auto",
                boxShadow:
                  status === "running" || !apiId.trim()
                    ? "none"
                    : "0 4px 16px rgba(107,63,160,0.3)",
              }}
            >
              {status === "running" ? (
                <Zap size={16} />
              ) : (
                <Play size={16} />
              )}
              {status === "running" ? "Running..." : "Run Agent"}
            </motion.button>
          </div>

          {/* Error banner */}
          {status === "error" && runError && (
            <div
              style={{
                backgroundColor: "#FFE0E0",
                borderRadius: 12,
                padding: "12px 16px",
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: "#B33A3A",
                marginBottom: 20,
              }}
            >
              {runError}
            </div>
          )}

          {/* Animated steps */}
          <AnimatePresence>
            {visibleSteps.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}
              >
                {visibleSteps.map((stepIndex) => (
                  <StepRow
                    key={stepIndex}
                    step={STEPS[stepIndex]}
                    index={stepIndex}
                    result={result}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* API response box */}
          <AnimatePresence>
            {status === "done" && result?.response && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: "#6B6B6B",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  API Response
                </p>
                <pre
                  style={{
                    backgroundColor: "#1E1E2E",
                    color: "#CDD6F4",
                    fontFamily: "monospace",
                    fontSize: 13,
                    padding: "20px",
                    borderRadius: 16,
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: 0,
                    lineHeight: 1.6,
                    maxHeight: 300,
                    overflowY: "auto",
                  }}
                >
                  {typeof result.response === "string"
                    ? result.response
                    : JSON.stringify(result.response, null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live transaction feed */}
        <div>
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: 18,
              color: "#2D2D2D",
              marginBottom: 20,
            }}
          >
            Live Transaction Feed
          </h2>
          <TransactionFeed apiId={apiId.trim() || undefined} />
        </div>

      </div>
    </div>
  );
}
