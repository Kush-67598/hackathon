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
      setLatestResult(result.sessionId, result.output);
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
      
      setLatestResult(result.sessionId, result.output);
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
    <>
      <div className="panel panel-hero" style={{ marginBottom: "var(--space-6)" }}>
        <h1>Lab Report Upload</h1>
        <p>Upload your lab report PDF and review extracted values before running the screening.</p>
      </div>

      <section className="panel">
        {/* Upload Area */}
        <div className="card" style={{ marginBottom: "var(--space-6)", textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-4xl)", marginBottom: "var(--space-3)" }}>📄</div>
          <h3>Upload Lab Report PDF</h3>
          <p style={{ marginBottom: "var(--space-4)", fontSize: "var(--text-sm)" }}>
            We support PDF lab reports. Values will be auto-extracted and shown below for review.
          </p>
          <label className="btn btn-primary btn-lg" style={{ cursor: "pointer", display: "inline-flex" }}>
            {uploading ? "🤖 Processing..." : "📎 Choose PDF File"}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
              disabled={uploading}
            />
          </label>
          {uploading && (
            <p style={{ marginTop: "var(--space-3)", color: "var(--color-primary)", fontSize: "var(--text-sm)" }}>
              Extracting values from your PDF...
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="alert alert-warning" style={{ marginBottom: "var(--space-4)" }}>
            <span>⚡</span>
            <div>
              <strong>Extraction warnings:</strong> {warnings.join(" | ")}
            </div>
          </div>
        )}

        {/* Lab Values Editor */}
        {hasAnyData && (
          <>
            <div className="section-title">
              <h3>🧪 Extracted Lab Values</h3>
            </div>
            <p style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-4)", color: "var(--color-text-muted)" }}>
              Review and edit extracted values. Values shown in{" "}
              <span style={{ color: "var(--color-success)", fontWeight: 600 }}>green</span> were auto-detected with high confidence.
            </p>

            <div className="form-grid">
              {LAB_FIELDS.map(({ key, label, unit, desc, color }) => {
                const conf = confidence[key];
                const confPct = Math.round((conf || 0) * 100);
                const hasValue = confirmedLabs[key] !== "";

                return (
                  <label key={key} style={{ flexDirection: "row", alignItems: "center", gap: "var(--space-3)" }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600 }}>{label}</span>
                      {confPct > 0 && (
                        <span
                          style={{
                            marginLeft: "var(--space-2)",
                            fontSize: "var(--text-xs)",
                            color: getConfidenceColor(confPct),
                            fontWeight: 600,
                          }}
                        >
                          {confPct}%
                        </span>
                      )}
                      <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: 400 }}>
                        {desc}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", minWidth: "140px" }}>
                      <input
                        type="number"
                        step="0.01"
                        value={confirmedLabs[key] ?? ""}
                        onChange={(e) => setConfirmedField(key, e.target.value)}
                        placeholder="—"
                        style={{
                          width: "90px",
                          textAlign: "right",
                          borderColor: hasValue ? color : undefined,
                          borderWidth: hasValue ? "2px" : undefined,
                        }}
                      />
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", minWidth: "40px" }}>
                        {unit}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </>
        )}

        {/* Extraction Snippets */}
        {snippets.length > 0 && (
          <>
            <div className="section-title">
              <h3>📝 Raw Text Snippets</h3>
            </div>
            <div className="card" style={{ background: "var(--color-bg)", marginBottom: "var(--space-4)" }}>
              {snippets.map((snippet, idx) => (
                <p key={idx} style={{ fontSize: "var(--text-xs)", fontFamily: "monospace", marginBottom: "var(--space-2)" }}>
                  {snippet}
                </p>
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="button-row">
          <button className="btn btn-secondary" onClick={() => navigate("/checkin")}>
            ← Back
          </button>
          <div style={{ flex: 1 }} />
          <button
            className="btn btn-outline btn-lg"
            onClick={handleSkipAndScreen}
            disabled={screening}
          >
            {screening ? "..." : "⏭️ Skip & Run Without Labs"}
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={runWithLabs}
            disabled={screening}
            style={{ minWidth: "180px" }}
          >
            {screening ? "🤖 Running..." : hasAnyData ? "▶️ Run Screening" : "▶️ Run Without Labs"}
          </button>
        </div>

        {skipWarning && (
          <div className="alert alert-warning" style={{ marginTop: "var(--space-4)" }}>
            <span>⚠️</span>
            <div>
              <strong>Results may be less accurate without lab values.</strong> For best results, upload a lab report with CBC, TSH, and ferritin levels. This screening is not a medical diagnosis.
            </div>
          </div>
        )}

        <div className="disclaimer" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-4)" }}>
          <span className="disclaimer-icon">ℹ️</span>
          <div>
            Auto-extraction from PDFs may not be 100% accurate. Please verify all values manually before proceeding with screening.
          </div>
        </div>
      </section>
    </>
  );
}
