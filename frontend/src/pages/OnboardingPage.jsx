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
    <>
      {/* Hero Panel */}
      <div className="panel panel-hero" style={{ marginBottom: "var(--space-6)" }}>
        <h1>Welcome to Niramaya</h1>
        <p>Let's personalize your screening experience. Answer a few quick questions to get started.</p>
      </div>

      {/* Main Form Panel */}
      <section className="panel" style={{ animationDelay: "0.1s" }}>
        {/* Step Progress */}
        <div className="step-row">
          {STEPS.map((s, idx) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <button
                type="button"
                className={`step-pill ${idx === step ? "active" : idx < step ? "completed" : ""}`}
                onClick={() => idx < step && setStep(idx)}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
              {idx < totalSteps - 1 && <div className={`step-connector ${idx < step ? "active" : ""}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Profile */}
        {step === 0 && (
          <div className="mcq-question">
            <h3>What's your age range?</h3>
            <p>Your age helps us calibrate screening sensitivity for your life stage.</p>
            <div className="mcq-options cols-3">
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
          <>
            <div className="mcq-question">
              <h3>How regular are your menstrual cycles?</h3>
              <p>Regular cycles are a key indicator of hormonal balance.</p>
              <div className="mcq-options cols-2">
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

            <div className="mcq-question">
              <h3>How would you describe your menstrual flow?</h3>
              <p>Heavy or irregular bleeding can signal various hormonal tendencies.</p>
              <div className="mcq-options cols-2">
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
          </>
        )}

        {/* Step 2: Lifestyle */}
        {step === 2 && (
          <>
            <div className="mcq-question">
              <h3>How well do you sleep?</h3>
              <p>Sleep quality directly impacts hormonal regulation and symptom patterns.</p>
              <div className="mcq-options cols-2">
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

            <div className="mcq-question">
              <h3>What's your typical stress level?</h3>
              <p>Chronic stress affects cortisol, thyroid function, and cycle regularity.</p>
              <div className="mcq-options cols-3">
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

            <div className="mcq-question">
              <h3>How often do you exercise?</h3>
              <p>Physical activity supports hormonal balance and metabolic health.</p>
              <div className="mcq-options cols-2">
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
          </>
        )}

        {/* Step 3: Diet & Wellness */}
        {step === 3 && (
          <>
            <div className="mcq-question">
              <h3>What best describes your diet?</h3>
              <p>Nutrition plays a critical role in hormonal health and deficiency risk.</p>
              <div className="mcq-options cols-2">
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

            <div className="mcq-question">
              <h3>Have you noticed any weight changes recently?</h3>
              <p>Unexplained weight gain or loss can indicate hormonal shifts.</p>
              <div className="mcq-options cols-2">
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
          </>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="button-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            ← Back
          </button>

          <div style={{ flex: 1 }} />

          {step < totalSteps - 1 ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep((s) => s + 1)}>
              Continue →
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving..." : "Complete Setup →"}
            </button>
          )}
        </div>
      </section>
    </>
  );
}
