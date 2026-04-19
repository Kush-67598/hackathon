import { NavLink, useNavigate } from "react-router-dom";
import { useProfileStore } from "../../stores/profileStore";
import { useAuthStore } from "../../stores/authStore";
import { useEffect, useState } from "react";
import { fetchScreenHistory } from "../../services/screenApi";

const navItems = [
  { to: "/onboarding", label: "Get Started", icon: "✨" },
  { to: "/checkin", label: "Check-in", icon: "📋" },
  { to: "/labs/upload", label: "Lab Upload", icon: "🔬" },
];

export function AppShell({ children }) {
  const navigate = useNavigate();
  const { userId } = useProfileStore();
  const { token } = useAuthStore();
  const [hasHistory, setHasHistory] = useState(false);

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

        <nav>
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
              <NavLink
                to="/doctors"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <span>👩‍⚕️</span>
                Find Doctors
              </NavLink>
              {hasHistory && (
                <NavLink
                  to="/timeline"
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  <span>📊</span>
                  Timeline
                </NavLink>
              )}
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
      </header>

      <main className="content-wrap">{children}</main>

      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          color: "var(--color-text-muted)",
          fontSize: "var(--text-xs)",
          borderTop: "1px solid var(--color-border-subtle)",
          marginTop: "auto",
        }}
      ></footer>
    </div>
  );
}
