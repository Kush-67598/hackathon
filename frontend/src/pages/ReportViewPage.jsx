import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { downloadSessionReport } from "../services/screenApi";
import { useScreeningStore } from "../stores/screeningStore";

const CONDITION_LABELS = {
  iron_deficiency_anemia: "Iron Deficiency Anemia",
  hypothyroidism: "Hypothyroidism",
  hyperthyroidism: "Hyperthyroidism",
  pcos: "Polycystic Ovary Syndrome (PCOS)",
  pcod: "Polycystic Ovarian Disease (PCOD)",
  endometriosis_tendency: "Endometriosis",
  insufficient_data: "Insufficient Data",
};

export function ReportViewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { latestOutput } = useScreeningStore();
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const blob = await downloadSessionReport(sessionId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cyclesense-report-${sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleShare() {
    const text = `Synthera Screening Result:\nPrimary: ${CONDITION_LABELS[latestOutput?.primary_tendency] || latestOutput?.primary_tendency}\nConfidence: ${Math.round((latestOutput?.confidence || 0) * 100)}%\n\nThis is a screening result, not a medical diagnosis.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!latestOutput) {
    return (
      <div className="panel panel-hero" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "var(--text-4xl)", marginBottom: "var(--space-4)" }}>📋</div>
        <h2>Report Unavailable</h2>
        <p>No screening session found. Please run a screening first.</p>
        <div className="button-row" style={{ justifyContent: "center", marginTop: "var(--space-6)" }}>
          <button className="btn btn-primary" onClick={() => navigate("/checkin")}>
            Start Check-in
          </button>
        </div>
      </div>
    );
  }

  const primaryLabel = CONDITION_LABELS[latestOutput.primary_tendency] || latestOutput.primary_tendency;
  const secondaryLabel = CONDITION_LABELS[latestOutput.secondary_tendency] || latestOutput.secondary_tendency || "None";
  const primaryConf = Math.round((latestOutput.confidence || 0) * 100);
  const secondaryConf = Math.round((latestOutput.secondary_confidence || 0) * 100);
  const recommendations = latestOutput.actionable_recommendations || latestOutput.recommendations || [];

  return (
    <>
      <div className="panel panel-hero" style={{ marginBottom: "var(--space-6)" }}>
        <h1>Your Screening Report</h1>
        <p>A shareable summary of your hormonal risk screening for follow-up with your healthcare provider.</p>
        <p style={{ fontSize: "var(--text-sm)", marginTop: "var(--space-2)" }}>Session ID: {sessionId}</p>
      </div>

      <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
        {/* Result Summary Card */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--color-primary-light), var(--color-accent-light))",
            border: "1px solid var(--color-primary-muted)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-8)",
            textAlign: "center",
            marginBottom: "var(--space-6)",
          }}
        >
          <div style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
            Primary Screening Tendency
          </div>
          <h2 style={{ color: "var(--color-primary)", fontSize: "var(--text-3xl)", marginBottom: "var(--space-4)" }}>
            {primaryLabel}
          </h2>
          <div
            style={{
              fontSize: "var(--text-4xl)",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              color: primaryConf >= 65 ? "var(--color-danger)" : primaryConf >= 35 ? "var(--color-warning)" : "var(--color-success)",
              marginBottom: "var(--space-3)",
            }}
          >
            {primaryConf}%
          </div>
          <div className="progress-track" style={{ maxWidth: "300px", margin: "0 auto", height: "14px" }}>
            <div className="progress-fill" style={{ width: `${primaryConf}%` }} />
          </div>
        </div>

        {/* Secondary Result */}
        {secondaryLabel !== "None" && (
          <div className="card" style={{ marginBottom: "var(--space-6)", background: "var(--color-bg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                  Secondary Tendency
                </p>
                <h3>{secondaryLabel}</h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--color-text-muted)" }}>
                  {secondaryConf}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="section-title">
          <h3>📋 Recommended Next Steps</h3>
        </div>
        {recommendations.length > 0 ? (
          recommendations.map((item, idx) => (
            <div key={idx} className="recommendation-card">
              <div className="rec-icon tracking">📌</div>
              <div className="rec-text">
                <div className="rec-title">{item}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No specific recommendations.</p>
        )}

        {/* Confounding Factors */}
        {(latestOutput.confounding_flags || []).length > 0 && (
          <>
            <div className="section-title">
              <h3>⚡ Lifestyle Factors to Consider</h3>
            </div>
            <div className="confound-tags">
              {(latestOutput.confounding_flags || []).map((flag) => (
                <span key={flag} className="confound-tag">
                  {flag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div className="disclaimer">
          <span className="disclaimer-icon">⚠️</span>
          <div>
            <strong>This is a screening result, not a medical diagnosis.</strong>
            <br />
            The information provided is based on symptom patterns and optional lab values. It does not replace professional medical evaluation. Always consult a qualified healthcare provider for proper diagnosis and treatment.
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="panel">
        <h3 style={{ marginBottom: "var(--space-4)" }}>Share Your Report</h3>
        <p style={{ marginBottom: "var(--space-4)" }}>
          Download a PDF report or share a text summary with your healthcare provider.
        </p>
        <div className="button-row">
          <button className="btn btn-primary" onClick={handleDownloadPdf} disabled={downloading}>
            {downloading ? "🤖 Generating..." : "📄 Download PDF Report"}
          </button>
          <button className="btn btn-secondary" onClick={handleShare}>
            {copied ? "✅ Copied!" : "📋 Copy Summary"}
          </button>
          <button className="btn btn-accent" onClick={() => navigate("/doctors", { state: { condition: latestOutput?.primary_tendency } })}>
            👩‍⚕️ Find Doctors
          </button>
          <button className="btn btn-ghost" onClick={() => navigate(`/results/${sessionId}`)}>
            ← Back
          </button>
        </div>
      </section>
    </>
  );
}
