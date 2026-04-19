import { NavLink, useNavigate } from "react-router-dom";
import { useProfileStore } from "../../stores/profileStore";
import { useAuthStore } from "../../stores/authStore";
import { useEffect, useState } from "react";
import { fetchScreenHistory } from "../../services/screenApi";

const navItemsForLoggedIn = [
  { to: "/checkin", label: "Check-in", icon: "📋" },
  { to: "/labs/upload", label: "Lab Upload", icon: "🔬" },
  { to: "/doctors", label: "Find Doctors", icon: "👩‍⚕️" },
];

const navItemsForLoggedOut = [];

export function AppShell({ children }) {
  const navigate = useNavigate();
  const { userId } = useProfileStore();
  const { token, clearAuth } = useAuthStore();
  const [hasHistory, setHasHistory] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = token ? navItemsForLoggedIn : navItemsForLoggedOut;

  useEffect(() => {
    async function checkHistory() {
      if (!userId || !token) return;
      try {
        const res = await fetchScreenHistory(userId);
        setHasHistory(res.data?.length > 0);
      } catch {
        setHasHistory(false);
      }
    }
    checkHistory();
  }, [userId, token]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="app-bg">
      <header className="top-nav">
        <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="brand-icon">🌸</div>
          <div className="brand-text">
            <span className="brand-name">Synthera</span>
            <span className="brand-tagline">Women's Health Screening</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {token ? (
            <>
              {hasHistory && (
                <NavLink
                  to="/timeline"
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  <span>📊</span>
                  Timeline
                </NavLink>
              )}
<button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }} title="Sign Out">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Sign In
              </NavLink>
              <NavLink to="/signup" className="nav-link" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                Sign Up Free
              </NavLink>
            </>
          )}
        </nav>

        {/* Hamburger (mobile only) */}
        <button
          className="hamburger-btn mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "none",
            background: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "pointer",
          }}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: "0 0 8px 8px",
            minWidth: 200,
            zIndex: 1000,
            padding: "8px 0"
          }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "var(--color-text)" }}
              >
                <span>{item.icon}</span> {item.label}
              </NavLink>
            ))}
            {token ? (
              <>
                {hasHistory && (
                  <NavLink
                    to="/timeline"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "var(--color-text)" }}
                  >
                    <span>📊</span> Timeline
                  </NavLink>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleLogout(); setMobileMenuOpen(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", color: "var(--color-text)", fontSize: "16px", touchAction: "manipulation" }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "var(--color-text)" }}>
                  Sign In
                </NavLink>
                <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "var(--color-primary)", fontWeight: 600 }}>
                  Sign Up Free
                </NavLink>
              </>
            )}
          </div>
        )}
      </header>

      <main className="content-wrap">{children}</main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-only { display: inline-flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
