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
    const text = `Niramaya Screening Result:\nPrimary: ${CONDITION_LABELS[latestOutput?.primary_tendency] || latestOutput?.primary_tendency}\nConfidence: ${Math.round((latestOutput?.confidence || 0) * 100)}%\n\nThis is a screening result, not a medical diagnosis.`;
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
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── HEADER SECTION ── */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Your Screening Report
        </h1>
        <p style={{ color: '#64748B', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          A professional summary of your hormonal risk factors, designed to facilitate discussions with your healthcare provider.
        </p>
        <div style={{ marginTop: '16px', display: 'inline-block', padding: '6px 14px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
          Session Ref: <span style={{ fontFamily: 'monospace', color: '#475569' }}>{sessionId}</span>
        </div>
      </div>

      {/* ── MAIN REPORT PANEL ── */}
      <section style={{ 
        maxWidth: '800px', 
        margin: '0 auto 32px', 
        background: '#FFFFFF', 
        borderRadius: '32px', 
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
        border: '1px solid #E2E8F0',
      }}>
        
        {/* ── PRIMARY RESULT HERO ── */}
        <div style={{
          background: 'linear-gradient(135deg, #F5F3FF, #FDF8FF)',
          border: '1px solid #EDE9FE',
          borderRadius: '24px',
          padding: '40px 24px',
          textAlign: 'center',
          marginBottom: '32px',
          position: 'relative'
        }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#7C6FCD", fontWeight: 800, marginBottom: "12px" }}>
            Primary Screening Tendency
          </div>
          <h2 style={{ color: "#2A1F4E", fontSize: "32px", fontWeight: 800, marginBottom: "20px", letterSpacing: '-0.02em' }}>
            {primaryLabel}
          </h2>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: "56px", 
              fontWeight: 900, 
              color: primaryConf >= 65 ? "#E11D48" : primaryConf >= 35 ? "#C9A44A" : "#10B981",
              lineHeight: 1 
            }}>
              {primaryConf}%
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600, marginTop: '8px' }}>Confidence Match Score</div>
          </div>

          <div style={{ background: '#FFFFFF', height: '10px', borderRadius: '20px', maxWidth: '300px', margin: '0 auto', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
            <div style={{ 
              width: `${primaryConf}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #7C6FCD, #B09EE8)',
              borderRadius: '20px',
              transition: 'width 1s ease-in-out'
            }} />
          </div>
        </div>

        {/* ── SECONDARY FINDINGS ── */}
        {secondaryLabel !== "None" && (
          <div style={{ 
            background: '#F8FAFC', 
            borderRadius: '20px', 
            padding: '20px 24px', 
            border: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div>
              <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94A3B8", fontWeight: 700, marginBottom: "4px" }}>
                Secondary Tendency
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{secondaryLabel}</h3>
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#64748B" }}>
              {secondaryConf}%
            </div>
          </div>
        )}

        {/* ── RECOMMENDATIONS ── */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ opacity: 0.5 }}>📋</span> Recommended Next Steps
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendations.length > 0 ? (
              recommendations.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  padding: '16px', 
                  background: '#FFFFFF', 
                  border: '1px solid #F1F5F9', 
                  borderRadius: '16px',
                  alignItems: 'center'
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F5F3FF', color: '#7C6FCD', display: 'grid', placeItems: 'center', fontSize: '14px', flexShrink: 0 }}>
                    📌
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569', lineHeight: 1.5 }}>{item}</div>
                </div>
              ))
            ) : (
              <p style={{ color: '#94A3B8', fontSize: '14px' }}>No specific recommendations generated.</p>
            )}
          </div>
        </div>

        {/* ── CONTEXTUAL FACTORS ── */}
        {(latestOutput.confounding_flags || []).length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ opacity: 0.5 }}>⚡</span> Lifestyle Considerations
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {(latestOutput.confounding_flags || []).map((flag) => (
                <span key={flag} style={{ 
                  padding: '8px 16px', 
                  background: '#FFFBEB', 
                  color: '#92400E', 
                  border: '1px solid #FEF3C7',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'capitalize'
                }}>
                  {flag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── CLINICAL DISCLAIMER ── */}
        <div style={{ 
          padding: '24px', 
          background: '#F1F5F9', 
          borderRadius: '24px', 
          fontSize: '13px', 
          color: '#64748B', 
          lineHeight: 1.6,
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', color: '#475569' }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <strong style={{ fontSize: '14px' }}>Medical Disclaimer</strong>
          </div>
          This document is a report of statistical symptom patterns and does not constitute a medical diagnosis, prognosis, or treatment plan. The results are intended for informational purposes to aid your consultation with a licensed medical professional. Always seek the advice of your physician regarding any medical condition.
        </div>
      </section>

      {/* ── ACTION BAR ── */}
      <section style={{ maxWidth: '800px', margin: '0 auto 60px', textAlign: 'center' }}>
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Share with your Doctor</h3>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
            Take the next step by either downloading this report or finding a nearby specialist.
          </p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleDownloadPdf} 
              disabled={downloading}
              style={{ 
                padding: '14px 28px', borderRadius: '14px', background: '#0F172A', color: '#FFF', 
                border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' 
              }}
            >
              {downloading ? "Generating..." : <><span>📄</span> Download PDF</>}
            </button>

            <button 
              onClick={handleShare} 
              style={{ 
                padding: '14px 28px', borderRadius: '14px', background: '#FFFFFF', color: '#475569', 
                border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '15px', cursor: 'pointer' 
              }}
            >
              {copied ? "✅ Copied!" : "📋 Copy Summary"}
            </button>

            <button 
              onClick={() => navigate("/doctors", { state: { condition: latestOutput?.primary_tendency } })}
              style={{ 
                padding: '14px 28px', borderRadius: '14px', background: 'linear-gradient(135deg, #7C6FCD, #9B8EDF)', 
                color: '#FFF', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(124, 111, 205, 0.2)' 
              }}
            >
              👩‍⚕️ Find Specialists
            </button>

            <button 
              onClick={() => navigate(`/results/${sessionId}`)}
              style={{ 
                padding: '14px 28px', borderRadius: '14px', background: 'transparent', color: '#94A3B8', 
                border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer' 
              }}
            >
              ← Back to Analysis
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
