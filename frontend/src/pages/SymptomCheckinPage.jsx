import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSymptomLog, parseChatSymptoms } from "../services/symptomApi";
import { useProfileStore } from "../stores/profileStore";
import { useSymptomStore } from "../stores/symptomStore";

const STEP_CONFIG = [
  {
    key: "physical_symptoms",
    title: "Step 1: Physical Symptoms",
    subtitle: "Primary signal for screening tendency",
    icon: "🩺",
  },
  {
    key: "emotional_symptoms",
    title: "Step 2: Emotional Wellbeing",
    subtitle: "Context modifier for confidence and severity",
    icon: "🧠",
  },
  {
    key: "behavioral_indicators",
    title: "Step 3: Lifestyle & Behavior",
    subtitle: "Daily pattern modifier for interpretation",
    icon: "🌿",
  },
];

const QUESTION_BANK = {
  fatigue: {
    label: "Fatigue",
    icon: "😴",
    question: "How often do you feel unusually tired or low on energy?",
    options: [
      { value: "none", label: "Not at all", desc: "I feel energetic most days" },
      { value: "rarely", label: "Rarely", desc: "Occasional tiredness" },
      { value: "sometimes", label: "Sometimes", desc: "A few days each week" },
      { value: "often", label: "Often", desc: "Most days" },
      { value: "always", label: "Almost always", desc: "Constant fatigue" },
    ],
    durationQ: "How long have you felt this way?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  hair_fall: {
    label: "Hair Fall",
    icon: "💇",
    question: "Have you noticed increased hair shedding or thinning?",
    options: [
      { value: "none", label: "No", desc: "No visible change" },
      { value: "mild", label: "Mild", desc: "Slightly increased shedding" },
      { value: "moderate", label: "Moderate", desc: "Visible thinning" },
      { value: "severe", label: "Severe", desc: "Significant hair loss" },
    ],
    durationQ: "How long has this been going on?",
    durationOptions: [
      { value: 4, label: "< 1 month" },
      { value: 8, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  weakness: {
    label: "Weakness / Dizziness",
    icon: "🫧",
    question: "Do you feel physically weak, lightheaded, or dizzy?",
    options: [
      { value: "none", label: "No", desc: "I feel steady" },
      { value: "rarely", label: "Rarely", desc: "Occasional episodes" },
      { value: "sometimes", label: "Sometimes", desc: "Frequent episodes" },
      { value: "often", label: "Often", desc: "Most days" },
      { value: "always", label: "Constantly", desc: "Daily weakness" },
    ],
    durationQ: "How long have you noticed this?",
    durationOptions: [
      { value: 1, label: "Just started" },
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "Over a month" },
    ],
  },
  irregular_cycles: {
    label: "Irregular Cycles",
    icon: "📅",
    question: "How regular are your menstrual cycles currently?",
    options: [
      { value: "very_regular", label: "Very regular", desc: "Predictable cycle" },
      { value: "regular", label: "Mostly regular", desc: "Minor variation" },
      { value: "irregular", label: "Irregular", desc: "Unpredictable timing" },
      { value: "highly_irregular", label: "Highly irregular", desc: "Major variation" },
      { value: "amenorrhea", label: "No periods", desc: "Periods stopped" },
    ],
    durationQ: "How long has this pattern continued?",
    durationOptions: [
      { value: 6, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6-12 months" },
      { value: 36, label: "1+ year" },
    ],
  },
  weight_gain: {
    label: "Weight Fluctuation",
    icon: "⚖️",
    question: "Have you noticed unexplained weight change?",
    options: [
      { value: "none", label: "No change", desc: "Weight stable" },
      { value: "slight_gain", label: "Slight gain", desc: "2-4 kg" },
      { value: "moderate_gain", label: "Moderate gain", desc: "4-8 kg" },
      { value: "significant_gain", label: "Significant gain", desc: "8+ kg" },
      { value: "weight_loss", label: "Unexplained loss", desc: "Unexpected loss" },
    ],
    durationQ: "When did this start?",
    durationOptions: [
      { value: 4, label: "< 1 month" },
      { value: 8, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  mood_fluctuations: {
    label: "Mood Fluctuations",
    icon: "🌊",
    question: "How variable has your mood been recently?",
    options: [
      { value: "none", label: "Stable", desc: "Mood is steady" },
      { value: "mild", label: "Mild shifts", desc: "Occasional ups/downs" },
      { value: "moderate", label: "Moderate shifts", desc: "Noticeable changes" },
      { value: "severe", label: "Strong swings", desc: "Frequent intense changes" },
    ],
    durationQ: "How long has this pattern continued?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  irritability: {
    label: "Irritability",
    icon: "😤",
    question: "How often do you feel unusually irritable?",
    options: [
      { value: "none", label: "Rarely", desc: "Not unusual for me" },
      { value: "mild", label: "Sometimes", desc: "Mild increase" },
      { value: "moderate", label: "Frequent", desc: "Notable impact" },
      { value: "severe", label: "Most days", desc: "Affects daily life" },
    ],
    durationQ: "How long have you noticed this?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  anxiety: {
    label: "Anxiety / Restlessness",
    icon: "💭",
    question: "How often do you feel anxious or restless without a clear trigger?",
    options: [
      { value: "none", label: "Rarely", desc: "Within normal range" },
      { value: "mild", label: "Sometimes", desc: "Occasional restlessness" },
      { value: "moderate", label: "Often", desc: "Frequent episodes" },
      { value: "severe", label: "Very often", desc: "Persistent anxiety" },
    ],
    durationQ: "How long has this been present?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  poor_sleep: {
    label: "Poor Sleep Quality",
    icon: "🛌",
    question: "How would you rate your sleep quality?",
    options: [
      { value: "none", label: "Good", desc: "Restful most nights" },
      { value: "mild", label: "Slightly poor", desc: "Occasional poor nights" },
      { value: "moderate", label: "Moderately poor", desc: "Frequent disturbed sleep" },
      { value: "severe", label: "Very poor", desc: "Sleep regularly disrupted" },
    ],
    durationQ: "How long has your sleep quality been affected?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  low_sunlight_exposure: {
    label: "Low Sunlight Exposure",
    icon: "🌥️",
    question: "How much daylight/sun exposure do you get in a typical day?",
    options: [
      { value: "none", label: "Good exposure", desc: "Most days outdoors" },
      { value: "mild", label: "Limited", desc: "Brief sunlight" },
      { value: "moderate", label: "Low", desc: "Rarely in daylight" },
      { value: "severe", label: "Very low", desc: "Mostly indoors" },
    ],
    durationQ: "How long has this routine been similar?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  sedentary_lifestyle: {
    label: "Low Physical Activity",
    icon: "🪑",
    question: "How physically active are you currently?",
    options: [
      { value: "none", label: "Active", desc: "Regular activity" },
      { value: "mild", label: "Slightly low", desc: "Reduced activity" },
      { value: "moderate", label: "Low", desc: "Mostly sedentary" },
      { value: "severe", label: "Very low", desc: "Minimal movement" },
    ],
    durationQ: "How long has this activity pattern continued?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
};

function SymptomCard({ symptom, categoryKey, onChange }) {
  const config = QUESTION_BANK[symptom.name];
  if (!config) return null;

  const currentValue = symptom.severity || "none";
  const currentDuration = symptom.durationWeeks || 4;

  return (
    <div className="card card-interactive" style={{ marginBottom: "var(--space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        <span style={{ fontSize: "var(--text-2xl)" }}>{config.icon}</span>
        <h3 style={{ marginBottom: 0 }}>{config.label}</h3>
      </div>

      <div className="mcq-question">
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: "var(--space-3)" }}>{config.question}</p>
        <div className="mcq-options">
          {config.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`mcq-option ${currentValue === opt.value ? "selected" : ""}`}
              onClick={() => onChange(categoryKey, symptom.name, "severity", opt.value)}
            >
              <div className="mcq-option-dot" />
              <div className="mcq-option-text">
                <span className="mcq-option-label">{opt.label}</span>
                <span className="mcq-option-desc">{opt.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mcq-question" style={{ marginTop: "var(--space-5)" }}>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: "var(--space-3)" }}>{config.durationQ}</p>
        <div className="mcq-options cols-4">
          {config.durationOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`mcq-option ${currentDuration === opt.value ? "selected" : ""}`}
              onClick={() => onChange(categoryKey, symptom.name, "durationWeeks", opt.value)}
            >
              <div className="mcq-option-dot" />
              <div className="mcq-option-text">
                <span className="mcq-option-label" style={{ fontSize: "var(--text-xs)" }}>{opt.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SymptomCheckinPage() {
  const navigate = useNavigate();
  const { userId } = useProfileStore();
  const {
    physical_symptoms,
    emotional_symptoms,
    behavioral_indicators,
    setSymptomField,
  } = useSymptomStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  const step = STEP_CONFIG[stepIndex];
  const stepSymptoms = useMemo(() => {
    if (step.key === "physical_symptoms") return physical_symptoms;
    if (step.key === "emotional_symptoms") return emotional_symptoms;
    return behavioral_indicators;
  }, [step, physical_symptoms, emotional_symptoms, behavioral_indicators]);

  const allSymptoms = useMemo(
    () => [...physical_symptoms, ...emotional_symptoms, ...behavioral_indicators],
    [physical_symptoms, emotional_symptoms, behavioral_indicators]
  );

  async function handleChatParse() {
    if (!chatText.trim()) {
      setError("Please describe your symptoms in the text box first.");
      return;
    }

    setChatLoading(true);
    setError("");

    try {
      const parsed = await parseChatSymptoms(chatText);
      (parsed.extractedSymptoms || []).forEach((item) => {
        const category = item.name === "mood_fluctuations" ? "emotional_symptoms" : "physical_symptoms";
        setSymptomField(category, item.name, "severity", item.severity);
        setSymptomField(category, item.name, "frequency", item.frequency);
        setSymptomField(category, item.name, "durationWeeks", item.durationWeeks);
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not parse symptom text. Try filling manually.");
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSave() {
    if (!userId) {
      setError("Please complete onboarding first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createSymptomLog({
        userId,
        symptoms: allSymptoms,
        physical_symptoms,
        emotional_symptoms,
        behavioral_indicators,
      });
      navigate("/labs/upload");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="panel panel-hero" style={{ marginBottom: "var(--space-6)" }}>
        <h1>Symptom Check-in</h1>
        <p>Complete all 3 steps for a cleaner and more accurate screening signal.</p>
      </div>

      <section className="panel">
        <div className="card" style={{ marginBottom: "var(--space-6)", background: "var(--color-accent-light)", border: "1px solid var(--color-accent-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
            <span style={{ fontSize: "var(--text-xl)" }}>💬</span>
            <div>
              <h4 style={{ marginBottom: 0 }}>Quick Symptom Input (Beta)</h4>
              <p style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-1)" }}>
                Example: "I feel tired with hair fall for 3 weeks and mood changes"
              </p>
            </div>
          </div>
          <textarea
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            rows={3}
            className="text-area"
            placeholder="Describe your symptoms in your own words..."
            style={{ marginBottom: "var(--space-3)" }}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleChatParse} disabled={chatLoading}>
            {chatLoading ? "🤖 Parsing..." : "🤖 Parse & Prefill"}
          </button>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ marginBottom: "var(--space-1)" }}>{step.icon} {step.title}</h3>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>{step.subtitle}</p>
            </div>
            <span className="indicator-badge medium">{stepIndex + 1} / 3</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {stepSymptoms.map((symptom) => (
          <SymptomCard
            key={symptom.name}
            symptom={symptom}
            categoryKey={step.key}
            onChange={setSymptomField}
          />
        ))}

        <div className="button-row">
          <button type="button" className="btn btn-secondary" onClick={() => (stepIndex === 0 ? navigate("/onboarding") : setStepIndex(stepIndex - 1))}>
            ← Back
          </button>
          <div style={{ flex: 1 }} />
          {stepIndex < STEP_CONFIG.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStepIndex(stepIndex + 1)}>
              Continue →
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-lg" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save & Continue →"}
            </button>
          )}
        </div>
      </section>
    </>
  );
}
