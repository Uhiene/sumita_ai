import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageWrapper from "./components/PageWrapper";
import Landing from "./pages/Landing";
import Wrap from "./pages/Wrap";
import Dashboard from "./pages/Dashboard";
import AgentDemo from "./pages/AgentDemo";
import Docs from "./pages/Docs";

// AnimatedRoutes must be a child of BrowserRouter so useLocation works.
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"          element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/wrap"      element={<PageWrapper><Wrap /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/demo"      element={<PageWrapper><AgentDemo /></PageWrapper>} />
        <Route path="/docs"      element={<PageWrapper><Docs /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
