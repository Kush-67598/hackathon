import { useState } from "react";
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
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <div className="brand-icon" style={{ margin: "0 auto var(--space-4)", width: "56px", height: "56px", fontSize: "24px" }}>
            🌸
          </div>
          <h1>Create Your Account</h1>
          <p className="subtitle">
            Join Niramaya to track your hormonal health over time with personalized screening insights.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Full Name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <span className="hint">At least 8 characters</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Choose a strong password"
              minLength={8}
              required
            />
          </label>

          <div
            style={{
              padding: "var(--space-4)",
              background: "var(--color-info-light)",
              border: "1px solid #93c5fd",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-xs)",
              color: "var(--color-info)",
            }}
          >
            <strong>Your data is private.</strong> We use industry-standard security. Your health information is never shared without your consent.
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "var(--space-2)" }} disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 600, color: "var(--color-primary)" }}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
