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
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <div className="brand-icon" style={{ margin: "0 auto var(--space-4)", width: "56px", height: "56px", fontSize: "24px" }}>
            🌸
          </div>
          <h1>Welcome Back</h1>
          <p className="subtitle">Sign in to access your screening history and continue tracking your health.</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
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
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Your password"
              required
            />
          </label>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "var(--space-2)" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ fontWeight: 600, color: "var(--color-primary)" }}>
            Create one here
          </Link>
        </p>

        <div className="disclaimer" style={{ marginTop: "var(--space-6)", fontSize: "var(--text-xs)" }}>
          <span className="disclaimer-icon">ℹ️</span>
          <div>
            Your data is private and secure. We never share personal health information with third parties.
          </div>
        </div>
      </div>
    </div>
  );
}
