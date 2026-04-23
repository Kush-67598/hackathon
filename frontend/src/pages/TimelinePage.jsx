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
  <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>
    
    {/* ── HEADER ── */}
    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.02em' }}>
        Your Health Timeline
      </h1>
      <p style={{ color: '#64748B', fontSize: '16px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
        Track your hormonal health trends, symptom patterns, and screening history in one place.
      </p>
    </div>

    {/* ── PROFILE SUMMARY PANEL ── */}
    <section style={{ 
      maxWidth: '900px', 
      margin: '0 auto 32px', 
      background: '#FFFFFF', 
      borderRadius: '28px', 
      padding: '32px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Profile Summary</h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Your baseline health context</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Age', value: profile.age || "—" },
          { label: 'Cycle Regularity', value: profile.cycleRegularity?.replace(/_/g, " ") || "—", isSmall: true },
          { label: 'Sleep/Night', value: `${profile.lifestyle?.sleepHours || 7}h` },
          { label: 'Check-ins', value: symptomLogs.length },
          { label: 'Screenings', value: sessions.length },
          { label: 'Latest Match', value: sessionPoints[0] ? `${Math.round(sessionPoints[0].confidence * 100)}%` : "—" }
        ].map((stat, i) => (
          <div key={i} style={{ padding: '20px', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <div style={{ fontSize: stat.isSmall ? '14px' : '22px', fontWeight: 800, color: '#7C6FCD', textTransform: stat.isSmall ? 'capitalize' : 'none' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginTop: '6px', letterSpacing: '0.02em' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>

    {error && (
      <div style={{ maxWidth: '900px', margin: '0 auto 24px', background: '#FFF1F2', border: '1px solid #FFE4E6', color: '#E11D48', padding: '16px', borderRadius: '16px', display: 'flex', gap: '12px', fontSize: '14px' }}>
        <span>⚠️</span> {error}
      </div>
    )}

    {/* ── SYMPTOM INTENSITY CHART ── */}
    {trendPoints.length > 0 && (
      <section style={{ maxWidth: '900px', margin: '0 auto 32px', background: '#FFFFFF', borderRadius: '28px', padding: '32px', border: '1px solid #E2E8F0' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Symptom Intensity Trend</h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Average severity reported during your check-ins</p>
        </div>

        <div style={{ overflowX: 'auto', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '180px', minWidth: 'max-content', padding: '0 10px', borderBottom: '2px solid #F1F5F9' }}>
            {trendPoints.map((point, idx) => (
              <div key={idx} style={{ flex: '0 0 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{ 
                    width: '24px', 
                    background: 'linear-gradient(to top, #7C6FCD, #B09EE8)', 
                    borderRadius: '6px 6px 2px 2px', 
                    height: `${Math.max(12, Math.round(point.severity * 30))}px`,
                    transition: 'height 1s ease',
                    boxShadow: '0 4px 10px rgba(124, 111, 205, 0.15)'
                  }}
                  title={`Severity: ${point.severity}`}
                />
                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{point.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )}

    {/* ── SCREENING HISTORY GRID ── */}
    <section style={{ maxWidth: '900px', margin: '0 auto 32px', background: '#FFFFFF', borderRadius: '28px', padding: '32px', border: '1px solid #E2E8F0' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Screening History</h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Review your clinical match probability over time</p>
      </div>

      {sessionPoints.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {sessionPoints.map((session) => {
            const label = CONDITION_LABELS[session.tendency] || session.tendency;
            const conf = Math.round(session.confidence * 100);
            const color = conf >= 65 ? '#7C6FCD' : conf >= 35 ? '#C9A44A' : '#94A3B8';

            return (
              <div
                key={session.sessionId}
                onClick={() => navigate(`/results/${session.sessionId}`)}
                style={{ 
                  cursor: "pointer", 
                  background: '#FFFFFF', 
                  padding: '24px', 
                  borderRadius: '24px', 
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#7C6FCD40'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(124, 111, 205, 0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: '16px' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#2A1F4E', lineHeight: 1.3 }}>{label}</h4>
                    <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, display: 'block', marginTop: '4px' }}>{session.date}</span>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '8px', background: '#F8FAFC', border: `1px solid ${color}40`, color: color, fontSize: '12px', fontWeight: 800 }}>
                    {conf}%
                  </div>
                </div>

                <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ width: `${conf}%`, height: '100%', background: color, transition: 'width 1s ease' }} />
                </div>

                <div style={{ fontSize: '13px', color: '#7C6FCD', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Analysis <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px", background: '#F8FAFC', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📊</div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#2A1F4E' }}>No screening sessions yet</h3>
          <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '300px', margin: '8px auto 0' }}>Complete a check-in and lab upload to see your trends here.</p>
        </div>
      )}
    </section>

    {/* ── SAFETY NOTICE ── */}
    <div style={{ maxWidth: '900px', margin: '0 auto 48px', padding: '24px', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '20px', fontSize: '13px', color: '#92400E', display: 'flex', gap: '16px', lineHeight: 1.6 }}>
      <span style={{ fontSize: '20px' }}>⚠️</span>
      <p style={{ margin: 0 }}>
        <strong>Information only:</strong> This timeline is a tracking support tool and <strong>not</strong> a clinical medical record. All screening results are patterns identified by algorithms and should be discussed with a qualified healthcare provider for proper diagnosis.
      </p>
    </div>

    {/* ── FOOTER NAVIGATION ── */}
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '60px', flexWrap: 'wrap' }}>
      <button onClick={() => navigate("/checkin")} style={{ padding: '14px 28px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
        ← New Check-in
      </button>
      <button onClick={() => navigate("/labs/upload")} style={{ padding: '14px 32px', borderRadius: '16px', background: 'linear-gradient(135deg, #7C6FCD, #9B8EDF)', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(124, 111, 205, 0.2)', transition: 'transform 0.2s' }}>
        Upload Lab Report
      </button>
    </div>
  </div>
);
}
