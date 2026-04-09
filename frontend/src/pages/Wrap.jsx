import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Zap, ArrowRight, LayoutDashboard } from "lucide-react";
import Sumita from "../components/Sumita";
import { useResponsive } from "../hooks/useResponsive";
import { wrapAPI } from "../lib/api";

const SUMITA_STATES = {
  idle: {
    pose: "point",
    message: "Just one command and your API is live. I'll walk you through it, promise it's easy!",
  },
  loading: {
    pose: "think",
    message: "Hang tight... I'm talking to the Stellar network. These things take like 4 seconds tops!",
  },
  success: {
    pose: "celebrate",
    message: "Your API is now live on Stellar! Share that endpoint and watch the payments roll in.",
  },
  error: {
    pose: "think",
    message: "Hmm, something went wonky. Let me try that again!",
  },
};

function CopyBox({ value, label }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "#6B6B6B",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </p>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#F9F5FF",
          border: "1.5px solid #E2D9F3",
          borderRadius: 12,
          padding: "10px 14px",
        }}
      >
        <code
          style={{
            flex: 1,
            fontFamily: "monospace",
            fontSize: 13,
            color: "#6B3FA0",
            wordBreak: "break-all",
          }}
        >
          {value}
        </code>
        <button
          onClick={handleCopy}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: copied ? "#4CAF50" : "#6B6B6B",
            padding: 4,
            flexShrink: 0,
          }}
          title="Copy"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function Wrap() {
  const { isMobile } = useResponsive();
  const [form, setForm] = useState({ name: "", endpointUrl: "", pricePerCall: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const sumita = SUMITA_STATES[status];

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const data = await wrapAPI({
        endpointUrl: form.endpointUrl,
        pricePerCall: form.pricePerCall,
      });
      setResult(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
    color: "#2D2D2D",
    backgroundColor: "#FFFFFF",
    border: "1.5px solid #FFD6E0",
    borderRadius: 12,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    display: "block",
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: "#6B6B6B",
    marginBottom: 6,
    fontWeight: 500,
  };

  return (
    <div style={{ backgroundColor: "#FFF8F0", minHeight: "100vh", padding: isMobile ? "40px 16px" : "60px 32px" }}>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          alignItems: "flex-start",
          gap: 48,
          flexWrap: "wrap",
        }}
      >
        {/* Left: Sumita — hidden on mobile to give form full width */}
        <div style={{ flex: "0 0 auto", paddingTop: 24, display: isMobile ? "none" : "block" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Sumita
                pose={sumita.pose}
                message={sumita.message}
                size="md"
                direction="left"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Form or Result — full width on mobile */}
        <div style={{ flex: "1 1 420px", minWidth: 0, width: isMobile ? "100%" : "auto" }}>
          <AnimatePresence mode="wait">
            {status !== "success" ? (
              /* ── Form card ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #FFD6E0",
                  borderRadius: 20,
                  padding: "36px 32px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <h1
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 24,
                    color: "#6B3FA0",
                    marginBottom: 8,
                  }}
                >
                  Wrap Your API
                </h1>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: "#6B6B6B",
                    marginBottom: 28,
                  }}
                >
                  Add a Stellar payment layer to any HTTP endpoint in seconds.
                </p>

                <form onSubmit={handleSubmit}>
                  {/* API Name */}
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="name" style={labelStyle}>API Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Weather API"
                      value={form.name}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  {/* Endpoint URL */}
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="endpointUrl" style={labelStyle}>Your API Endpoint URL</label>
                    <input
                      id="endpointUrl"
                      name="endpointUrl"
                      type="url"
                      required
                      placeholder="https://api.example.com/data"
                      value={form.endpointUrl}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 28 }}>
                    <label htmlFor="pricePerCall" style={labelStyle}>Price Per Call in USDC</label>
                    <input
                      id="pricePerCall"
                      name="pricePerCall"
                      type="number"
                      required
                      step="0.001"
                      min="0.001"
                      placeholder="e.g. 0.01"
                      value={form.pricePerCall}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <div
                      style={{
                        backgroundColor: "#FFE0E0",
                        borderRadius: 12,
                        padding: "12px 16px",
                        marginBottom: 20,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        color: "#B33A3A",
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={{ scale: status === "loading" ? 1 : 1.03 }}
                    whileTap={{ scale: status === "loading" ? 1 : 0.97 }}
                    style={{
                      width: "100%",
                      backgroundColor: status === "loading" ? "#9B84C8" : "#6B3FA0",
                      color: "#FFFFFF",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      padding: "14px 24px",
                      borderRadius: 16,
                      border: "none",
                      cursor: status === "loading" ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      minHeight: 44,
                      boxShadow: "0 4px 16px rgba(107,63,160,0.35)",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <Zap size={16} />
                    {status === "loading" ? "Generating..." : "Generate Payment Gateway"}
                    {status !== "loading" && <ArrowRight size={16} />}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              /* ── Success result card ── */
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #D4F5E9",
                  borderRadius: 20,
                  padding: "36px 32px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#6B3FA0",
                    marginBottom: 6,
                  }}
                >
                  Your API is live
                </h2>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: "#6B6B6B",
                    marginBottom: 28,
                  }}
                >
                  Share the wrapped endpoint below. Callers pay in USDC, you earn automatically.
                </p>

                <CopyBox label="Wrapped Endpoint" value={result.wrappedEndpoint} />
                <CopyBox label="Your Stellar Wallet Address" value={result.stellarAddress} />

                <div
                  style={{
                    backgroundColor: "#F9F5FF",
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: 28,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: "#6B3FA0",
                  }}
                >
                  Price per call:{" "}
                  <strong>{result.pricePerCall} USDC</strong>
                </div>

                <Link to="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: "100%",
                      backgroundColor: "#6B3FA0",
                      color: "#FFFFFF",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      padding: "14px 24px",
                      borderRadius: 16,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 4px 16px rgba(107,63,160,0.35)",
                    }}
                  >
                    <LayoutDashboard size={16} />
                    View Dashboard
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
