import { NavLink, useNavigate } from "react-router-dom";
import { useProfileStore } from "../../stores/profileStore";
import { useAuthStore } from "../../stores/authStore";
import { useEffect, useState } from "react";
import { fetchScreenHistory } from "../../services/screenApi";

const navItemsForLoggedIn = [
  { to: "/onboarding", label: "Get Started", icon: "✨" },
  { to: "/checkin", label: "Check-in", icon: "📋" },
  { to: "/labs/upload", label: "Lab Upload", icon: "🔬" },
  { to: "/doctors", label: "Find Doctors", icon: "👩‍⚕️" },
];

const navItemsForLoggedOut = [];

export function AppShell({ children }) {
  const navigate = useNavigate();
  const { userId } = useProfileStore();
  const { token, logout } = useAuthStore();
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
    logout();
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
        <nav className="desktop-nav">
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
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Sign Out
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

        {/* Mobile Hamburger */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            fontSize: 24,
            cursor: "pointer",
            padding: 8
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
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", color: "var(--color-text)" }}
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
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}