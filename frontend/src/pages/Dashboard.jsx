import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Phone, Layers, Bot } from "lucide-react";
import Sumita from "../components/Sumita";
import EarningsChart from "../components/EarningsChart";
import TransactionFeed from "../components/TransactionFeed";
import { useResponsive } from "../hooks/useResponsive";
import { getEarnings, listWrappedAPIs } from "../lib/api";

const POLL_MS = 5000;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

function StatCard({ icon: Icon, label, value, unit, accent, index }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      style={{
        backgroundColor: "#FFFFFF",
        border: "2px solid #FFD6E0",
        borderRadius: 16,
        padding: "24px 20px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: accent + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={15} color={accent} />
        </div>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "#6B6B6B",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 28,
          color: "#6B3FA0",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: "#6B6B6B",
              marginLeft: 6,
            }}
          >
            {unit}
          </span>
        )}
      </p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { isMobile, isTablet } = useResponsive();
  const [earnings, setEarnings] = useState(null);
  const [wrapCount, setWrapCount] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const [earningsData, wrapData] = await Promise.all([
        getEarnings(),
        listWrappedAPIs(),
      ]);
      setEarnings(earningsData);
      setWrapCount(wrapData.count);
      setError(null);
    } catch (err) {
      console.error("[dashboard] fetch failed:", err.message);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, POLL_MS);
    return () => clearInterval(id);
  }, [fetchStats]);

  const totalCalls = earnings?.totalCalls ?? 0;
  const totalEarned = parseFloat(earnings?.totalEarned ?? "0");

  const sumitaPose = totalCalls === 0 ? "think" : "celebrate";
  const sumitaMsg =
    totalCalls === 0
      ? "No calls yet — but they're coming. Share your endpoint and watch the magic happen!"
      : "Cha-ching! Your APIs are out there earning. Your wallet just got heavier!";

  const stats = [
    {
      icon: TrendingUp,
      label: "Total Earned",
      value: totalEarned.toFixed(4),
      unit: "USDC",
      accent: "#6B3FA0",
    },
    {
      icon: Phone,
      label: "Total API Calls",
      value: totalCalls,
      unit: null,
      accent: "#1A6FA0",
    },
    {
      icon: Layers,
      label: "APIs Wrapped",
      value: wrapCount ?? "—",
      unit: null,
      accent: "#2D7A5A",
    },
  ];

  return (
    <div style={{ backgroundColor: "#FFF8F0", minHeight: "100vh", padding: isMobile ? "32px 16px 60px" : "48px 32px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Header row ───────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 32,
            marginBottom: 36,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                color: "#2D2D2D",
                marginBottom: 6,
              }}
            >
              Dashboard
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                color: "#6B6B6B",
              }}
            >
              Your APIs, your earnings, live on Stellar testnet.
            </p>
          </div>

          {/* Sumita top-right — hidden on mobile to save space */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sumita pose={sumitaPose} message={sumitaMsg} size="sm" direction="left" />
            </motion.div>
          )}
        </div>

        {/* ── Error banner ─────────────────────────────── */}
        {error && (
          <div
            style={{
              backgroundColor: "#FFE0E0",
              borderRadius: 16,
              padding: "14px 18px",
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: "#B33A3A",
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        {/* ── Stat cards ───────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
              ? "1fr 1fr"
              : "repeat(4, 1fr)",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}

          {/* Run Demo Agent button card */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ display: "flex", alignItems: "stretch" }}
          >
            <Link to="/demo" style={{ display: "flex", width: "100%" }}>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(107,63,160,0.2)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1,
                  backgroundColor: "#6B3FA0",
                  border: "2px solid #6B3FA0",
                  borderRadius: 16,
                  padding: "24px 20px",
                  boxShadow: "0 4px 16px rgba(107,63,160,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bot size={15} color="#FFFFFF" />
                </div>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#FFFFFF",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  Run Demo Agent
                </p>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* ── Earnings chart ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          style={{
            backgroundColor: "#FFFFFF",
            border: "2px solid #FFD6E0",
            borderRadius: 20,
            padding: "28px 24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: "#2D2D2D",
              marginBottom: 20,
            }}
          >
            Earnings Over Time
          </h2>
          <EarningsChart pollMs={POLL_MS} />
        </motion.div>

        {/* ── Transaction feed ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          style={{
            backgroundColor: "#FFFFFF",
            border: "2px solid #FFD6E0",
            borderRadius: 20,
            padding: "28px 24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: "#2D2D2D",
              marginBottom: 20,
            }}
          >
            Live Transactions
          </h2>
          <TransactionFeed />
        </motion.div>

      </div>
    </div>
  );
}
