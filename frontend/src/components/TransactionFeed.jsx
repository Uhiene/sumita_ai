import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, Phone } from "lucide-react";
import Sumita from "./Sumita";

const BASE = "http://localhost:3001";

// Returns a human-readable "time ago" string from a Unix ms timestamp.
function timeAgo(ms) {
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 5)  return "just now";
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

// Truncates a tx hash: "ABCDE...FGHIJ"
function truncateHash(hash) {
  if (!hash) return "—";
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function TransactionCard({ tx, isNew }) {
  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        backgroundColor: "#FFFFFF",
        border: "1.5px solid #FFD6E0",
        borderRadius: 12,
        padding: "14px 16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: "#F3EEFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Zap size={16} color="#6B3FA0" />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              color: "#6B3FA0",
            }}
          >
            {parseFloat(tx.amount).toFixed(4)} USDC
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#6B6B6B",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {truncateHash(tx.tx_hash)}
          </span>
        </div>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "#6B6B6B",
            margin: 0,
            marginTop: 2,
          }}
        >
          {timeAgo(tx.created_at)}
          {tx.endpoint_url && (
            <span style={{ marginLeft: 8, color: "#C9B8FF" }}>
              · {tx.endpoint_url.replace(/^https?:\/\//, "").slice(0, 30)}
            </span>
          )}
        </p>
      </div>

      {/* Amount badge */}
      <div
        style={{
          backgroundColor: "#D4F5E9",
          borderRadius: 20,
          padding: "4px 10px",
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          color: "#2D7A5A",
          fontWeight: 600,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        paid
      </div>
    </motion.div>
  );
}

/**
 * TransactionFeed — live-polling list of payments.
 *
 * Props:
 *   apiId   string | undefined   if provided, scopes feed to that wrapped API
 */
export default function TransactionFeed({ apiId }) {
  const [data, setData] = useState(null);      // { totalCalls, totalEarned, transactions }
  const [error, setError] = useState(null);
  const seenIds = useRef(new Set());
  const newIds = useRef(new Set());

  const url = apiId
    ? `${BASE}/earnings/${apiId}`
    : `${BASE}/earnings`;

  async function fetchData() {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();

      // Detect which IDs are newly arrived since last fetch
      newIds.current = new Set();
      json.transactions.forEach((tx) => {
        if (!seenIds.current.has(tx.id)) {
          newIds.current.add(tx.id);
          seenIds.current.add(tx.id);
        }
      });

      setData(json);
      setError(null);
    } catch (err) {
      console.error("[TransactionFeed] fetch failed:", err.message);
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiId]);

  // Loading state
  if (!data && !error) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <Sumita pose="think" message="Hang tight... I'm talking to the Stellar network. These things take like 4 seconds tops!" size="sm" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#FFE0E0",
          borderRadius: 16,
          padding: "16px 20px",
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: "#B33A3A",
        }}
      >
        Could not load transactions: {error}
      </div>
    );
  }

  const { totalCalls, totalEarned, transactions } = data;
  const isEmpty = transactions.length === 0;

  return (
    <div>
      {/* Totals header */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 140,
            backgroundColor: "#F3EEFF",
            border: "1.5px solid #E2D9F3",
            borderRadius: 16,
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <TrendingUp size={14} color="#6B3FA0" />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: "#6B3FA0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Total Earned
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "#6B3FA0",
              margin: 0,
            }}
          >
            {parseFloat(totalEarned).toFixed(4)}{" "}
            <span style={{ fontSize: 14, fontWeight: 400 }}>USDC</span>
          </p>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 140,
            backgroundColor: "#D6F0FF",
            border: "1.5px solid #B3E0F7",
            borderRadius: 16,
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Phone size={14} color="#1A6FA0" />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: "#1A6FA0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Total Calls
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "#1A6FA0",
              margin: 0,
            }}
          >
            {totalCalls}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div style={{ padding: "32px 0", display: "flex", justifyContent: "center" }}>
          <Sumita
            pose="think"
            message="No calls yet — but they're coming. Share your endpoint and watch the magic happen!"
            size="md"
          />
        </div>
      ) : (
        /* Transaction list */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxHeight: 420,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          <AnimatePresence initial={false}>
            {transactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                tx={tx}
                isNew={newIds.current.has(tx.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
