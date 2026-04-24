import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/niramaya-logo.png";
import { useProfileStore } from "../../stores/profileStore";
import { useAuthStore } from "../../stores/authStore";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchScreenHistory } from "../../services/screenApi";

const COLORS = {
  iris: "#7C6FCD",
  indigo: "#2A1F4E",
  petal: "#F0E8F8",
  white: "#FFFFFF",
  mauve: "#C8A7D8",
};

const navItemsForLoggedIn = [
  { to: "/checkin", label: "Check-in", icon: "📋" },
  { to: "/labs/upload", label: "Lab Upload", icon: "🔬" },
  { to: "/doctors", label: "Find Doctors", icon: "👩‍⚕️" },
];

export function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useProfileStore();
  const { token, clearAuth } = useAuthStore();
  const [hasHistory, setHasHistory] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function checkHistory() {
      if (!userId || !token) return;
      try {
        const res = await fetchScreenHistory(userId);
        setHasHistory(res.data?.length > 0);
      } catch { setHasHistory(false); }
    }
    checkHistory();
  }, [userId, token]);

  // Close mobile menu on route change
  useEffect(() => setMobileMenuOpen(false), [location]);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const navItems = token ? navItemsForLoggedIn : [];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FAF8FF" }}>
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 6vw",
        transition: "all 0.3s ease",
        background: scrolled ? "rgba(255, 255, 255, 0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${COLORS.mauve}40` : "1px solid transparent",
      }}>
        {/* BRAND */}
        <div 
          onClick={() => navigate("/")} 
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.iris}, #9B8EDF)`, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            <img src={logo} alt="Niramaya Logo" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 800, fontSize: "18px", color: COLORS.indigo, lineHeight: 1 }}>Niramaya</span>
            <span style={{ fontSize: "10px", fontWeight: 600, color: COLORS.iris, textTransform: "uppercase", letterSpacing: "0.05em" }}>Women's Health</span>
          </div>
        </div>

        {token && (
          <>
            {/* DESKTOP NAV */}
            <nav className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} style={navLinkStyle} className={({ isActive }) => isActive ? "active-nav" : ""}>
                  <span style={{ fontSize: '14px' }}>{item.icon}</span> {item.label}
                </NavLink>
              ))}

              {hasHistory && (
                <NavLink to="/timeline" style={navLinkStyle} className={({ isActive }) => isActive ? "active-nav" : ""}>
                  <span>📊</span> Timeline
                </NavLink>
              )}

              <div style={{ width: "1px", height: "20px", background: `${COLORS.indigo}20`, margin: "0 8px" }} />

              <button onClick={handleLogout} style={logoutButtonStyle} title="Sign Out">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Logout</span>
              </button>
            </nav>

            {/* HAMBURGER (Mobile) */}
            <button
              className="mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={hamburgerStyle}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>

            {/* MOBILE MENU */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={mobileMenuContainerStyle}
                >
                  {[...navItems, ...(hasHistory ? [{ to: "/timeline", label: "Timeline", icon: "📊" }] : [])].map((item) => (
                    <NavLink key={item.to} to={item.to} style={mobileNavLinkStyle}>
                      {item.icon} {item.label}
                    </NavLink>
                  ))}
                  <hr style={{ border: 'none', borderTop: `1px solid ${COLORS.mauve}40`, margin: '8px 0' }} />
                  <button onClick={handleLogout} style={{ ...mobileNavLinkStyle, color: '#ef4444', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
                    🚪 Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </header>

      <main style={{ flex: 1, paddingTop: "72px" }}>{children}</main>

      <footer style={{ padding: "40px 6vw", background: COLORS.white, borderTop: `1px solid ${COLORS.mauve}30` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: `${COLORS.indigo}70` }}>© {new Date().getFullYear()} Niramaya Health</span>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: `${COLORS.indigo}50` }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>

      <style>{`
        .desktop-only { display: flex; }
        .mobile-only { display: none; }
        .active-nav { color: ${COLORS.iris} !important; background: ${COLORS.iris}10 !important; }
        
        @media (max-width: 868px) {
          .desktop-only { display: none; }
          .mobile-only { display: flex; }
        }
      `}</style>
    </div>
  );
}

// --- Styles ---

const navLinkStyle = {
  padding: "8px 16px",
  borderRadius: "10px",
  textDecoration: "none",
  color: `${COLORS.indigo}CC`,
  fontSize: "14px",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease",
};

const signUpButtonStyle = {
  padding: "10px 20px",
  borderRadius: "12px",
  background: COLORS.iris,
  color: COLORS.white,
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 700,
  boxShadow: `0 4px 12px ${COLORS.iris}30`,
};

const logoutButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "10px",
  border: "none",
  background: "transparent",
  color: "#ef4444",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

const hamburgerStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  border: `1px solid ${COLORS.mauve}40`,
  background: COLORS.white,
  color: COLORS.indigo,
  fontSize: "20px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mobileMenuContainerStyle = {
  position: "absolute",
  top: "80px",
  left: "6vw",
  right: "6vw",
  background: COLORS.white,
  borderRadius: "20px",
  padding: "16px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  border: `1px solid ${COLORS.mauve}40`,
};

const mobileNavLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px 16px",
  textDecoration: "none",
  color: COLORS.indigo,
  fontSize: "16px",
  fontWeight: 500,
  borderRadius: "12px",
};
