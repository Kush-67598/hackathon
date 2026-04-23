import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadLabReport } from "../services/labApi";
import { runScreening } from "../services/screenApi";
import { useLabStore } from "../stores/labStore";
import { useProfileStore } from "../stores/profileStore";
import { useScreeningStore } from "../stores/screeningStore";
import { useSymptomStore } from "../stores/symptomStore";

const LAB_FIELDS = [
  { key: "hemoglobin", label: "Hemoglobin", unit: "g/dL", desc: "Normal: 12-16 g/dL", color: "#dc2626" },
  { key: "tsh", label: "TSH", unit: "mIU/L", desc: "Normal: 0.4-4.0 mIU/L", color: "#2563eb" },
  { key: "ferritin", label: "Ferritin", unit: "ng/mL", desc: "Normal: 12-150 ng/mL", color: "#7c3aed" },
  { key: "t3", label: "T3 (Triiodothyronine)", unit: "ng/mL", desc: "Normal: 0.8-2.0 ng/mL", color: "#0891b2" },
  { key: "t4", label: "T4 (Thyroxine)", unit: "μg/dL", desc: "Normal: 4.5-12 μg/dL", color: "#059669" },
  { key: "lh", label: "LH", unit: "mIU/mL", desc: "Normal: 2-15 mIU/mL", color: "#d97706" },
  { key: "fsh", label: "FSH", unit: "mIU/mL", desc: "Normal: 3-10 mIU/mL", color: "#e11d48" },
];

function getConfidenceColor(pct) {
  if (pct >= 80) return "var(--color-success)";
  if (pct >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

export function LabUploadPage() {
  const navigate = useNavigate();
  const { userId, profile } = useProfileStore();
  const { physical_symptoms, emotional_symptoms, behavioral_indicators } = useSymptomStore();
  const { setLatestResult } = useScreeningStore();
  const { setExtractionResult, confirmedLabs, setConfirmedField, snippets, confidence, warnings } = useLabStore();

  const [uploading, setUploading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [skipWarning, setSkipWarning] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported. Please upload a lab report PDF.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const result = await uploadLabReport(file);
      setExtractionResult(result);
    } catch (err) {
      setError(err.response?.data?.message || "Could not parse the lab report. Please check the PDF and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function runWithLabs() {
    if (!userId) {
      setError("Please complete onboarding before screening.");
      return;
    }

    setScreening(true);
    setError("");
    setSkipWarning(false);
    try {
      const labValues = {};
      LAB_FIELDS.forEach(({ key }) => {
        const val = confirmedLabs[key];
        labValues[key] = val === "" || val === undefined || val === null ? null : Number(val);
      });

      const result = await runScreening({
        userId,
        profile,
        labs: labValues,
        labValues,
        physical_symptoms,
        emotional_symptoms,
        behavioral_indicators,
        symptoms: [...physical_symptoms, ...emotional_symptoms, ...behavioral_indicators],
      });
      setLatestResult(result.sessionId, result.output, result.conditionDetails);
      navigate(`/results/${result.sessionId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Screening failed. Please try again.");
    } finally {
      setScreening(false);
    }
  }

  async function handleSkipAndScreen() {
    console.log("handleSkipAndScreen called", { userId: !!userId, profile: !!profile });
    
    if (!userId) {
      setError("Please complete onboarding before screening.");
      return;
    }

    setScreening(true);
    setError("");
    setSkipWarning(true);
    try {
      const labValues = {};
      LAB_FIELDS.forEach(({ key }) => {
        labValues[key] = null;
      });

      console.log("Calling runScreening with:", {
        userId,
        physical_symptoms: physical_symptoms?.slice(0, 2),
        emotional_symptoms: emotional_symptoms?.slice(0, 2),
        behavioral_indicators: behavioral_indicators?.slice(0, 2),
      });

      const result = await runScreening({
        userId,
        profile,
        labs: labValues,
        labValues,
        physical_symptoms,
        emotional_symptoms,
        behavioral_indicators,
        symptoms: [...physical_symptoms, ...emotional_symptoms, ...behavioral_indicators],
      });
      
      console.log("runScreening result:", result);
      
      if (!result?.sessionId || !result?.output) {
        throw new Error("Invalid response from screening: missing sessionId or output");
      }
      
      setLatestResult(result.sessionId, result.output, result.conditionDetails);
      navigate(`/results/${result.sessionId}`);
    } catch (err) {
      console.error("Screening error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Screening failed. Please try again.";
      setError(errorMsg);
    } finally {
      setScreening(false);
    }
  }

  const hasAnyData = LAB_FIELDS.some(({ key }) => confirmedLabs[key] !== "");

 return (
  <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
    {/* ── HERO SECTION ── */}
    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.02em' }}>
        Lab Report Upload
      </h1>
      <p style={{ color: '#64748B', fontSize: '16px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
        Upload your PDF lab report. Our AI will extract values to improve your screening accuracy.
      </p>
    </div>

    {/* ── MAIN CONTENT PANEL ── */}
    <section style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      background: '#FFFFFF', 
      borderRadius: '32px', 
      padding: '32px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      border: '1px solid #E2E8F0',
    }}>

      {/* ── MODERN UPLOAD AREA ── */}
      <div style={{ 
        background: '#F5F3FF', 
        border: '2px dashed #DCD7F9', 
        borderRadius: '24px', 
        padding: '48px 32px', 
        textAlign: 'center',
        marginBottom: '32px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", filter: 'drop-shadow(0 4px 12px rgba(124, 111, 205, 0.2))' }}>📄</div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#2A1F4E', marginBottom: '8px' }}>
          {uploading ? "Analyzing Report..." : "Upload Lab Report PDF"}
        </h3>
        <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px' }}>
          We support standard PDF reports. Your values will be auto-extracted for review.
        </p>

        <label style={{ 
          display: "inline-flex", 
          alignItems: 'center', 
          gap: '10px',
          background: 'linear-gradient(135deg, #7C6FCD, #9B8EDF)', 
          color: '#FFFFFF', 
          padding: '14px 32px', 
          borderRadius: '16px', 
          fontWeight: 700, 
          cursor: uploading ? "not-allowed" : "pointer",
          boxShadow: '0 8px 20px rgba(124, 111, 205, 0.2)',
          transition: 'transform 0.2s ease'
        }}>
          {uploading ? "🤖 Processing..." : "📎 Choose PDF File"}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Error & Warnings */}
      {error && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FFE4E6', color: '#E11D48', padding: '16px', borderRadius: '16px', marginBottom: '20px', display: 'flex', gap: '12px', fontSize: '14px' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div style={{ background: '#FFF9E5', border: '1px solid #FBF4E0', color: '#C9A44A', padding: '16px', borderRadius: '16px', marginBottom: '20px', display: 'flex', gap: '12px', fontSize: '14px' }}>
          <span>⚡</span>
          <div><strong>Extraction warnings:</strong> {warnings.join(" | ")}</div>
        </div>
      )}

      {/* ── LAB VALUES EDITOR ── */}
      {hasAnyData && (
        <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>🧪 Extracted Lab Values</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              Review and edit extracted values. High confidence matches are highlighted.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {LAB_FIELDS.map(({ key, label, unit, desc, color }) => {
              const confPct = Math.round((confidence[key] || 0) * 100);
              const hasValue = confirmedLabs[key] !== "" && confirmedLabs[key] !== null;

              return (
                <div key={key} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '16px 20px', 
                  background: hasValue ? '#FFFFFF' : '#F8FAFC', 
                  borderRadius: '16px', 
                  border: hasValue ? `1.5px solid ${color}40` : '1px solid #E2E8F0',
                  boxShadow: hasValue ? '0 2px 8px rgba(0,0,0,0.02)' : 'none'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{label}</span>
                      {confPct > 0 && (
                        <span style={{ 
                          fontSize: '11px', 
                          color: getConfidenceColor(confPct), 
                          fontWeight: 800, 
                          background: '#F1F5F9', 
                          padding: '2px 8px', 
                          borderRadius: '6px' 
                        }}>
                          {confPct}% Match
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{desc}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="number"
                      step="0.01"
                      value={confirmedLabs[key] ?? ""}
                      onChange={(e) => setConfirmedField(key, e.target.value)}
                      placeholder="—"
                      style={{
                        width: "85px",
                        padding: '10px',
                        borderRadius: '10px',
                        border: `1.5px solid ${hasValue ? color : '#CBD5E1'}`,
                        textAlign: "right",
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0F172A',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, width: '45px' }}>{unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raw Text Snippets - Tucked away in a cleaner accordion-style card */}
      {snippets.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#64748B' }}>📝 Raw Text Snippets</h3>
          </div>
          <div style={{ 
            background: "#F8FAFC", 
            padding: '16px', 
            borderRadius: '16px', 
            border: '1px solid #E2E8F0',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {snippets.map((snippet, idx) => (
              <p key={idx} style={{ fontSize: "11px", fontFamily: "monospace", color: '#94A3B8', marginBottom: "4px" }}>
                {snippet}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── NAVIGATION BUTTONS ── */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginTop: "40px", 
        paddingTop: "32px", 
        borderTop: "1px solid #F1F5F9",
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate("/checkin")}
          style={{ padding: '12px 24px', borderRadius: '14px' }}
        >
          ← Back
        </button>
        
        <div style={{ flex: 1 }} />

        <button
          onClick={handleSkipAndScreen}
          disabled={screening}
          style={{ 
            background: 'transparent', 
            color: '#64748B', 
            border: 'none', 
            fontSize: '14px', 
            fontWeight: 600, 
            cursor: 'pointer',
            padding: '12px'
          }}
        >
          {screening ? "..." : "⏭️ Skip & run without labs"}
        </button>

        <button
          onClick={runWithLabs}
          disabled={screening}
          style={{
            background: screening ? '#94A3B8' : 'linear-gradient(135deg, #7C6FCD, #9B8EDF)',
            color: '#FFFFFF',
            padding: '14px 32px',
            borderRadius: '16px',
            border: 'none',
            fontWeight: 700,
            fontSize: '16px',
            cursor: screening ? 'not-allowed' : 'pointer',
            boxShadow: screening ? 'none' : '0 8px 20px rgba(124, 111, 205, 0.2)',
            minWidth: "180px",
            transition: 'transform 0.2s'
          }}
        >
          {screening ? "🤖 Running..." : hasAnyData ? "▶️ Run Screening" : "▶️ Run Without Labs"}
        </button>
      </div>

      {skipWarning && (
        <div style={{ 
          background: '#FFF9E5', 
          border: '1px solid #FBF4E0', 
          color: '#C9A44A', 
          padding: '16px', 
          borderRadius: '16px', 
          marginTop: '24px', 
          display: 'flex', 
          gap: '12px', 
          fontSize: '13px',
          lineHeight: 1.5
        }}>
          <span>⚠️</span>
          <div>
            <strong>Accuracy Note:</strong> Results may be less accurate without lab values (CBC, TSH, Ferritin). This is a screening tool, not a medical diagnosis.
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '32px', 
        padding: '16px', 
        background: '#F1F5F9', 
        borderRadius: '12px', 
        display: 'flex', 
        gap: '12px', 
        fontSize: '12px', 
        color: '#64748B', 
        lineHeight: 1.5 
      }}>
        <span>ℹ️</span>
        <div>
          Auto-extraction is not 100% accurate. Please verify all values manually before proceeding.
        </div>
      </div>
    </section>

    <style>{`
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
);
}
