import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Zap, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useResponsive } from "../hooks/useResponsive";

const links = [
  { to: "/",          label: "Home" },
  { to: "/wrap",      label: "Wrap API" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/demo",      label: "Demo" },
  { to: "/docs",      label: "Docs" },
];

const linkStyle = (isActive) => ({
  fontFamily: "'Inter', sans-serif",
  fontSize: 15,
  fontWeight: isActive ? 600 : 400,
  color: isActive ? "#6B3FA0" : "#6B6B6B",
  backgroundColor: isActive ? "#F3EEFF" : "transparent",
  padding: "10px 18px",
  borderRadius: 20,
  textDecoration: "none",
  display: "block",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  transition: "background-color 0.15s, color 0.15s",
});

export default function Navbar() {
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close drawer on navigation
  const handleNavClick = () => setOpen(false);

  return (
    <>
      <nav
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "2px solid #FFD6E0",
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <NavLink
          to="/"
          onClick={handleNavClick}
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#6B3FA0",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            letterSpacing: "-0.01em",
          }}
        >
          <Zap size={18} color="#FFD700" fill="#FFD700" />
          Sumita AI
        </NavLink>

        {/* Desktop nav links */}
        {!isMobile && (
          <ul
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} end={to === "/"} style={({ isActive }) => linkStyle(isActive)}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            style={{
              background: "none",
              border: "none",
              color: "#6B3FA0",
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobile && open && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              backgroundColor: "#FFFFFF",
              borderBottom: "2px solid #FFD6E0",
              zIndex: 49,
              padding: "12px 16px 20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {links.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    onClick={handleNavClick}
                    style={({ isActive }) => ({
                      ...linkStyle(isActive),
                      borderRadius: 14,
                      padding: "12px 20px",
                      fontSize: 16,
                    })}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
