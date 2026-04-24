import { useState } from "react";
import logo from "../assets/niramaya-logo.png";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authApi";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";

export function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { setUserId } = useProfileStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await registerUser(form);
      setAuth({ token: data.token, user: data.user });
      setUserId(data.user.userId);
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
      maxWidth: "480px", 
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
            <img src={logo} alt="Niramaya Logo" style={{ width: "32px", height: "32px" }} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", marginBottom: "10px", letterSpacing: "-0.02em" }}>
            Create Your Account
          </h1>
          <p style={{ fontSize: "15px", color: "#64748B", lineHeight: "1.5" }}>
            Join Niramaya to track your hormonal health over time with personalized screening insights.
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#1E293B" }}>
            Full Name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
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
              onFocus={(e) => { e.target.style.borderColor = "#7C6FCD"; e.target.style.background = "#FFF"; e.target.style.boxShadow = "0 0 0 4px rgba(124, 111, 205, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; e.target.style.boxShadow = "none"; }}
            />
          </label>

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
              onFocus={(e) => { e.target.style.borderColor = "#7C6FCD"; e.target.style.background = "#FFF"; e.target.style.boxShadow = "0 0 0 4px rgba(124, 111, 205, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; e.target.style.boxShadow = "none"; }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#1E293B" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Password</span>
              <span style={{ fontWeight: 400, color: "#94A3B8", fontSize: "12px" }}>At least 8 characters</span>
            </div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Choose a strong password"
              minLength={8}
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
              onFocus={(e) => { e.target.style.borderColor = "#7C6FCD"; e.target.style.background = "#FFF"; e.target.style.boxShadow = "0 0 0 4px rgba(124, 111, 205, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; e.target.style.boxShadow = "none"; }}
            />
          </label>

          <div style={{ 
            padding: "16px", 
            background: "#EFF6FF", 
            border: "1px solid #DBEAFE", 
            borderRadius: "16px", 
            fontSize: "12px", 
            color: "#1E40AF",
            lineHeight: "1.5",
            marginTop: "8px"
          }}>
            <strong style={{ display: "block", marginBottom: "2px" }}>🛡️ Your data is private.</strong> 
            We use industry-standard security. Your health information is never shared without your explicit consent.
          </div>

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
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "#64748B" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 700, color: "#7C6FCD", textDecoration: "none" }}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  </div>
);
}
