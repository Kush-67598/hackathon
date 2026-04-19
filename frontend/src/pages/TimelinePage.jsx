import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchScreenHistory } from "../services/screenApi";
import { fetchSymptoms } from "../services/symptomApi";
import { useProfileStore } from "../stores/profileStore";

const CONDITION_LABELS = {
  iron_deficiency_anemia: "Iron Deficiency",
  hypothyroidism: "Hypothyroidism",
  hyperthyroidism: "Hyperthyroidism",
  pcos: "PCOS",
  pcod: "PCOD",
  endometriosis_tendency: "Endometriosis",
};

function avgSeverity(symptoms) {
  if (!symptoms || !symptoms.length) return 0;
  const total = symptoms.reduce((sum, item) => sum + Number(item.severity || 0), 0);
  return Number((total / symptoms.length).toFixed(1));
}

export function TimelinePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { profile } = useProfileStore();
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!userId) return;
      try {
        const [symptomRes, sessionRes] = await Promise.all([
          fetchSymptoms(userId),
          fetchScreenHistory(userId),
        ]);
        setSymptomLogs(symptomRes.data || []);
        setSessions(sessionRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load timeline data.");
      }
    }
    load();
  }, [userId]);

  const trendPoints = useMemo(
    () =>
      symptomLogs.map((log) => ({
        date: new Date(log.loggedAt).toLocaleDateString("en", { month: "short", day: "numeric" }),
        severity: avgSeverity(log.symptoms),
        fullDate: new Date(log.loggedAt),
      })),
    [symptomLogs]
  );

  const sessionPoints = useMemo(
    () =>
      sessions.map((s) => ({
        date: new Date(s.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" }),
        confidence: Number(s.output?.confidence || 0),
        tendency: s.output?.primary_tendency,
        sessionId: s._id,
      })),
    [sessions]
  );

  return (
    <>
      <div className="panel panel-hero" style={{ marginBottom: "var(--space-6)" }}>
        <h1>Your Health Timeline</h1>
        <p>Track your symptom patterns and screening history over time.</p>
      </div>

      {/* Profile Summary */}
      <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="panel-header">
          <div>
            <h2>Profile Summary</h2>
            <p>Your health context from onboarding</p>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{profile.age || "—"}</div>
            <div className="stat-label">Age</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: "var(--text-base)" }}>
              {profile.cycleRegularity?.replace(/_/g, " ") || "—"}
            </div>
            <div className="stat-label">Cycle Regularity</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profile.lifestyle?.sleepHours || 7}h</div>
            <div className="stat-label">Sleep / Night</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{symptomLogs.length}</div>
            <div className="stat-label">Check-ins</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{sessions.length}</div>
            <div className="stat-label">Screenings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{sessionPoints[0] ? `${Math.round(sessionPoints[0].confidence * 100)}%` : "—"}</div>
            <div className="stat-label">Latest Confidence</div>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Symptom Trend */}
      {trendPoints.length > 0 && (
        <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
          <div className="panel-header">
            <div>
              <h2>Symptom Intensity Trend</h2>
              <p>Average symptom severity over your check-ins</p>
            </div>
          </div>
          <div className="timeline-chart">
            {trendPoints.map((point, idx) => (
              <div key={idx} className="bar-wrap">
                <div
                  className="bar"
                  style={{ height: `${Math.max(8, Math.round(point.severity * 20))}px` }}
                  title={`Severity: ${point.severity}`}
                />
                <span className="bar-label">{point.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Screening History */}
      <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="panel-header">
          <div>
            <h2>Screening History</h2>
            <p>Your past hormonal screening sessions</p>
          </div>
        </div>

        {sessionPoints.length > 0 ? (
          <div className="result-grid">
            {sessionPoints.map((session) => {
              const label = CONDITION_LABELS[session.tendency] || session.tendency;
              const conf = Math.round(session.confidence * 100);
              const indicator =
                conf >= 65 ? "high" : conf >= 35 ? "medium" : "low";

              return (
                <div
                  key={session.sessionId}
                  className="card card-interactive"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/results/${session.sessionId}`)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                    <div>
                      <h4 style={{ marginBottom: "var(--space-1)" }}>{label}</h4>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                        {session.date}
                      </span>
                    </div>
                    <span className={`indicator-badge ${indicator}`}>
                      {conf}%
                    </span>
                  </div>

                  <div style={{ marginBottom: "var(--space-3)" }}>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${conf}%` }} />
                    </div>
                  </div>

                  <button className="btn btn-ghost btn-sm" style={{ width: "100%" }}>
                    View Details →
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-text-muted)" }}>
            <div style={{ fontSize: "var(--text-4xl)", marginBottom: "var(--space-3)" }}>📊</div>
            <p>No screening sessions yet.</p>
            <p style={{ fontSize: "var(--text-sm)" }}>Complete a check-in and lab upload to generate your first screening.</p>
          </div>
        )}
      </section>

      {/* Safety Notice */}
      <div className="disclaimer">
        <span className="disclaimer-icon">⚠️</span>
        <div>
          <strong>This is a screening tool, not a medical diagnosis.</strong> Always consult a healthcare provider for proper medical advice.
        </div>
      </div>

      {/* Navigation */}
      <div className="button-row" style={{ marginTop: "var(--space-6)" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/checkin")}>
          ← New Check-in
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => navigate("/labs/upload")}>
          Upload Lab Report
        </button>
      </div>
    </>
  );
}
