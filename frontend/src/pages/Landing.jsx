import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, DollarSign, Bot } from "lucide-react";
import Sumita from "../components/Sumita";
import { useResponsive } from "../hooks/useResponsive";

const FEATURE_CARDS = [
  {
    Icon: Zap,
    color: "#6B3FA0",
    bg: "#F3EEFF",
    title: "5 Minute Setup",
    body: "One form. Instant Stellar wallet. Your API is live.",
  },
  {
    Icon: DollarSign,
    color: "#2D7A5A",
    bg: "#D4F5E9",
    title: "Earn Per Call",
    body: "Every API call earns you USDC on Stellar automatically.",
  },
  {
    Icon: Bot,
    color: "#1A6FA0",
    bg: "#D6F0FF",
    title: "Agent Ready",
    body: "AI agents can discover and pay for your API autonomously.",
  },
];

const STEPS = [
  "Enter your API URL and set your price",
  "Get your Stellar wallet and wrapped endpoint",
  "Share it. Agents pay. You earn.",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Landing() {
  const { isMobile } = useResponsive();
  return (
    <div style={{ backgroundColor: "#FFF8F0", minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: isMobile ? "40px 20px 80px" : "80px 32px 120px",
          position: "relative",
        }}
      >
        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: isMobile ? "column-reverse" : "row",
            alignItems: isMobile ? "center" : "center",
            justifyContent: "space-between",
            gap: isMobile ? 28 : 48,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {/* Left: copy + CTA (bottom on mobile due to column-reverse) */}
          <motion.div
            style={{ flex: "1 1 400px", minWidth: 0 }}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.2,
                color: "#2D2D2D",
                marginBottom: 20,
              }}
            >
              The payment layer the internet was missing.
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 18,
                color: "#6B6B6B",
                lineHeight: 1.7,
                marginBottom: 36,
                maxWidth: 480,
              }}
            >
              Wrap any API with Stellar micropayments in 5 minutes. Earn USDC
              per call. No blockchain knowledge needed.
            </p>
            <Link to="/wrap">
              <motion.button
                whileHover={{ backgroundColor: "#5A3490", scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  backgroundColor: "#6B3FA0",
                  color: "#FFFFFF",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "14px 32px",
                  borderRadius: 16,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(107,63,160,0.35)",
                  letterSpacing: "0.01em",
                  transition: "background-color 0.2s",
                }}
              >
                Wrap Your First API Free →
              </motion.button>
            </Link>
          </motion.div>

          {/* Right/Top: Sumita — wave pose, landing dialogue */}
          <motion.div
            style={{ flex: "0 0 auto", textAlign: "center", width: isMobile ? "100%" : "auto" }}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <Sumita pose="hero" size="hero" />
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#6B3FA0",
                marginTop: 12,
                maxWidth: 220,
                lineHeight: 1.5,
                fontStyle: "italic",
              }}
            >
              "Hey there! I'm Sumita. Let's get you earning while you sleep!"
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Feature Cards ────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {FEATURE_CARDS.map(({ Icon, color, bg, title, body }, i) => (
            <motion.div
              key={title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              style={{
                backgroundColor: "#FFFFFF",
                border: "2px solid #FFD6E0",
                borderRadius: 16,
                padding: "32px 28px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon size={22} color={color} />
              </div>
              <h3
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: 18,
                  color: "#2D2D2D",
                  marginBottom: 8,
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "#6B6B6B",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section
        style={{
          backgroundColor: "#FFFFFF",
          borderTop: "2px solid #FFD6E0",
          borderBottom: "2px solid #FFD6E0",
          padding: "72px 32px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              color: "#2D2D2D",
              textAlign: "center",
              marginBottom: 52,
            }}
          >
            How it works
          </motion.h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20px" }}
                variants={fadeUp}
                style={{ display: "flex", alignItems: "center", gap: 24 }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "#6B3FA0",
                    color: "#FFFFFF",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(107,63,160,0.25)",
                  }}
                >
                  {i + 1}
                </div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 17,
                    color: "#2D2D2D",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {step}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
