import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveProfile } from "../services/profileApi";
import { useProfileStore } from "../stores/profileStore";

const STEPS = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "cycle", label: "Cycle Health", icon: "🔄" },
  { id: "lifestyle", label: "Lifestyle", icon: "🌿" },
  { id: "diet", label: "Diet & Wellness", icon: "🍎" },
];

const AGE_RANGES = [
  { value: 18, label: "18 - 25", desc: "Young adult" },
  { value: 26, label: "26 - 35", desc: "Prime reproductive years" },
  { value: 36, label: "36 - 45", desc: "Perimenopause transition" },
  { value: 46, label: "46 - 55", desc: "Menopause transition" },
  { value: 56, label: "56+", desc: "Post-menopause" },
];

const CYCLE_REGULARITY = [
  { value: "very_regular", label: "Very Regular", desc: "28–30 day cycles" },
  { value: "regular", label: "Regular", desc: "30–35 day cycles" },
  { value: "slightly_irregular", label: "Slightly Irregular", desc: "35–45 day cycles" },
  { value: "highly_irregular", label: "Highly Irregular", desc: "Unpredictable" },
  { value: "no_cycles", label: "No Cycles", desc: "Post-menopause or other" },
];

const FLOW_HEAVINESS = [
  { value: "light", label: "Light", desc: "Light bleeding, 1-2 pads/day" },
  { value: "moderate", label: "Moderate", desc: "Regular flow, 3-4 pads/day" },
  { value: "heavy", label: "Heavy", desc: "Heavy flow, 5+ pads/day" },
  { value: "very_heavy", label: "Very Heavy", desc: "Soaking through frequently" },
];

const SLEEP_QUALITY = [
  { value: 9, label: "Excellent", desc: "8+ hours, wake refreshed" },
  { value: 7, label: "Good", desc: "7-8 hours, mostly rested" },
  { value: 5, label: "Fair", desc: "5-6 hours, occasional tiredness" },
  { value: 3, label: "Poor", desc: "Less than 5 hours, fatigued" },
];

const STRESS_LEVELS = [
  { value: 1, label: "Very Low", desc: "Relaxed, minimal stress" },
  { value: 2, label: "Low", desc: "Mostly calm" },
  { value: 3, label: "Moderate", desc: "Manageable stress" },
  { value: 4, label: "High", desc: "Frequent stress" },
  { value: 5, label: "Very High", desc: "Overwhelming stress" },
];

const EXERCISE_FREQ = [
  { value: "none", label: "None", desc: "Sedentary lifestyle" },
  { value: "light", label: "Light", desc: "Occasional walks" },
  { value: "moderate", label: "Moderate", desc: "3-4 times per week" },
  { value: "active", label: "Active", desc: "5+ times per week" },
];

const DIET_TYPES = [
  { value: "omnivore", label: "Omnivore", desc: "Mixed diet with meat & vegetables" },
  { value: "vegetarian", label: "Vegetarian", desc: "No meat, includes dairy & eggs" },
  { value: "vegan", label: "Vegan", desc: "No animal products" },
  { value: "other", label: "Other / Custom", desc: "Specific diet approach" },
];

const WEIGHT_CHANGES = [
  { value: "stable", label: "Stable", desc: "No significant change" },
  { value: "gained", label: "Weight Gained", desc: "Noticed weight increase" },
  { value: "lost", label: "Weight Lost", desc: "Noticed weight decrease" },
];

function McqOption({ option, selected, onClick }) {
  return (
    <button type="button" className={`mcq-option ${selected ? "selected" : ""}`} onClick={onClick}>
      <div className="mcq-option-dot" />
      <div className="mcq-option-text">
        <span className="mcq-option-label">{option.label}</span>
        <span className="mcq-option-desc">{option.desc}</span>
      </div>
    </button>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { profile, setProfileField, setLifestyleField, setUserId } = useProfileStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = STEPS.length;

  async function handleSubmit() {
    setSaving(true);
    setError("");
    try {
      const response = await saveProfile(profile);
      setUserId(response.data?._id || response._id);
      navigate("/checkin");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

 return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── HERO SECTION ── */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Welcome to Niramaya
        </h1>
        <p style={{ color: '#64748B', fontSize: '16px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          Let's personalize your screening experience. Answer a few quick questions to get started.
        </p>

        {/* Visual Step Tracker */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ 
              width: i === step ? '40px' : '12px', 
              height: '6px', 
              borderRadius: '10px', 
              background: i <= step ? 'linear-gradient(135deg, #7C6FCD, #9B8EDF)' : '#CBD5E1',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          ))}
        </div>
      </div>

      {/* ── MAIN FORM PANEL ── */}
      <section style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        background: '#FFFFFF', 
        borderRadius: '32px', 
        padding: '32px',
        boxShadow: '0 20px 40px rgba(42, 31, 78, 0.04)',
        border: '1px solid #E2E8F0',
        position: 'relative'
      }}>

        {/* Step Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '40px', 
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: '4px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {STEPS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => idx < step && setStep(idx)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 16px',
                cursor: idx < step ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: idx === step ? '#7C6FCD' : idx < step ? '#1E293B' : '#94A3B8',
                fontWeight: idx === step ? 700 : 600,
                fontSize: '14px',
                position: 'relative',
                whiteSpace: 'nowrap',
                transition: 'color 0.3s ease'
              }}
            >
              <span style={{ fontSize: '18px' }}>{s.icon}</span>
              {s.label}
              {idx === step && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-4px', 
                  left: 0, 
                  right: 0, 
                  height: '3px', 
                  background: '#7C6FCD', 
                  borderRadius: '10px' 
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Form Content Area */}
        <div style={{ minHeight: '300px' }}>
          {/* Step 0: Profile */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>What's your age range?</h3>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Your age helps us calibrate screening sensitivity for your life stage.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {AGE_RANGES.map((opt) => (
                  <McqOption
                    key={opt.value}
                    option={opt}
                    selected={profile.age === opt.value}
                    onClick={() => setProfileField("age", opt.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Cycle Health */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Menstrual Regularity</h3>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Regular cycles are a key indicator of hormonal balance.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {CYCLE_REGULARITY.map((opt) => (
                    <McqOption
                      key={opt.value}
                      option={opt}
                      selected={profile.cycleRegularity === opt.value}
                      onClick={() => setProfileField("cycleRegularity", opt.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Flow Description</h3>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Heavy or irregular bleeding can signal various hormonal tendencies.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {FLOW_HEAVINESS.map((opt) => (
                    <McqOption
                      key={opt.value}
                      option={opt}
                      selected={profile.flow === opt.value}
                      onClick={() => setProfileField("flow", opt.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Lifestyle */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Sleep Quality</h3>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Sleep quality directly impacts hormonal regulation and symptom patterns.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {SLEEP_QUALITY.map((opt) => (
                    <McqOption
                      key={opt.value}
                      option={opt}
                      selected={profile.lifestyle.sleepHours === opt.value}
                      onClick={() => setLifestyleField("sleepHours", opt.value)}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Typical Stress Level</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {STRESS_LEVELS.map((opt) => (
                    <McqOption
                      key={opt.value}
                      option={opt}
                      selected={profile.lifestyle.stressLevel === opt.value}
                      onClick={() => setLifestyleField("stressLevel", opt.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Exercise Frequency</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {EXERCISE_FREQ.map((opt) => (
                    <McqOption
                      key={opt.value}
                      option={opt}
                      selected={profile.lifestyle.exerciseFrequency === opt.value}
                      onClick={() => setLifestyleField("exerciseFrequency", opt.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Diet & Wellness */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Dietary Profile</h3>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Nutrition plays a critical role in hormonal health and deficiency risk.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {DIET_TYPES.map((opt) => (
                    <McqOption
                      key={opt.value}
                      option={opt}
                      selected={profile.dietType === opt.value}
                      onClick={() => setProfileField("dietType", opt.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Weight Changes</h3>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Unexplained weight shifts can indicate hormonal tendencies.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {WEIGHT_CHANGES.map((opt) => (
                    <McqOption
                      key={opt.value}
                      option={opt}
                      selected={profile.weightChange === opt.value}
                      onClick={() => setProfileField("weightChange", opt.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ 
            background: '#FFF5F5', 
            border: '1px solid #FED7D7', 
            color: '#C53030', 
            padding: '16px 20px', 
            borderRadius: '16px', 
            marginTop: '24px',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ── BUTTON ROW ── */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginTop: "40px", 
          paddingTop: "32px", 
          borderTop: "1px solid #F1F5F9" 
        }}>
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#475569',
              padding: '14px 28px',
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
              opacity: step === 0 ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            ← Back
          </button>

          <div style={{ flex: 1 }} />

          {step < totalSteps - 1 ? (
            <button 
              type="button" 
              onClick={() => {
                setStep((s) => s + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{
                background: 'linear-gradient(135deg, #7C6FCD, #9B8EDF)',
                border: 'none',
                color: '#FFFFFF',
                padding: '14px 36px',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(124, 111, 205, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #C9A44A, #E8C97A)',
                border: 'none',
                color: '#2A1F4E',
                padding: '16px 40px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '16px',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 22px rgba(201, 164, 74, 0.3)',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {saving ? "Saving..." : "Complete Setup →"}
            </button>
          )}
        </div>
      </section>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mcq-option {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          transition: all 0.2s ease;
        }
        .mcq-option:hover {
          border-color: #7C6FCD60;
          background: #F8FAFC;
        }
        .mcq-option.selected {
          border: 2px solid #7C6FCD !important;
          background: #F5F3FF !important;
        }
      `}</style>
    </div>
  );
}
