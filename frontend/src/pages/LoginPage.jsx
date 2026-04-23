import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authApi";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { setUserId } = useProfileStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(form);
      setAuth({ token: data.token, user: data.user });
      setUserId(data.user.userId);
      navigate("/checkin");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div style={{ 
    minHeight: "100vh", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    background: "#F8FAFC", 
    padding: "24px",
    fontFamily: "'Inter', system-ui, sans-serif"
  }}>
    <div style={{ 
      width: "100%", 
      maxWidth: "440px", 
      background: "#FFFFFF", 
      borderRadius: "32px", 
      padding: "40px", 
      boxShadow: "0 20px 40px rgba(42, 31, 78, 0.05)",
      border: "1px solid #E2E8F0",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative background element */}
      <div style={{ 
        position: "absolute", 
        top: "-50px", 
        right: "-50px", 
        width: "150px", 
        height: "150px", 
        background: "radial-gradient(circle, #F5F3FF 0%, transparent 70%)", 
        zIndex: 0 
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ 
            margin: "0 auto 20px", 
            width: "64px", 
            height: "64px", 
            background: "linear-gradient(135deg, #7C6FCD, #9B8EDF)", 
            borderRadius: "20px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "28px",
            boxShadow: "0 8px 16px rgba(124, 111, 205, 0.2)" 
          }}>
            🌸
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", marginBottom: "10px", letterSpacing: "-0.02em" }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: "15px", color: "#64748B", lineHeight: "1.5" }}>
            Sign in to access your screening history and continue tracking your health.
          </p>
        </div>

        {error && (
          <div style={{ 
            background: "#FFF1F2", 
            border: "1px solid #FFE4E6", 
            color: "#E11D48", 
            padding: "14px 16px", 
            borderRadius: "16px", 
            marginBottom: "24px", 
            fontSize: "14px", 
            display: "flex", 
            alignItems: "center", 
            gap: "10px",
            fontWeight: 500
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#1E293B" }}>
            Email Address
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              style={{
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1.5px solid #E2E8F0",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s",
                background: "#F8FAFC"
              }}
              onFocus={(e) => { e.target.style.borderColor = "#7C6FCD"; e.target.style.background = "#FFF"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#1E293B" }}>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Your password"
              required
              style={{
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1.5px solid #E2E8F0",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s",
                background: "#F8FAFC"
              }}
              onFocus={(e) => { e.target.style.borderColor = "#7C6FCD"; e.target.style.background = "#FFF"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; }}
            />
          </label>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: "100%", 
              marginTop: "12px", 
              padding: "16px", 
              borderRadius: "16px", 
              background: loading ? "#94A3B8" : "linear-gradient(135deg, #7C6FCD, #9B8EDF)", 
              color: "#FFFFFF", 
              border: "none", 
              fontWeight: 700, 
              fontSize: "16px", 
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 8px 20px rgba(124, 111, 205, 0.25)",
              transition: "transform 0.2s"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "#64748B" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ fontWeight: 700, color: "#7C6FCD", textDecoration: "none" }}>
            Create one here
          </Link>
        </p>

        <div style={{ 
          marginTop: "32px", 
          padding: "16px", 
          background: "#F1F5F9", 
          borderRadius: "16px", 
          fontSize: "12px", 
          color: "#64748B", 
          display: "flex", 
          gap: "12px", 
          lineHeight: "1.6" 
        }}>
          <span style={{ fontSize: "16px" }}>🔒</span>
          <div>
            Your data is private and secure. We never share personal health information with third parties.
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
