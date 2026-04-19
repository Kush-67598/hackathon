import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchRiskProgression } from "../services/screenApi";
import { useProfileStore } from "../stores/profileStore";
import { useScreeningStore } from "../stores/screeningStore";

const CONDITION_LABELS = {
  anemia: "Iron-deficiency anemia tendency",
  "Iron-deficiency anemia tendency": "Iron-deficiency anemia tendency",
  hypothyroidism: "Hypothyroidism tendency",
  "Hypothyroidism tendency": "Hypothyroidism tendency",
  hyperthyroidism: "Hyperthyroidism tendency",
  "Hyperthyroidism tendency": "Hyperthyroidism tendency",
  pcos: "PCOS/PCOD tendency",
  "PCOS/PCOD tendency": "PCOS/PCOD tendency",
  lifestyle_fatigue: "Lifestyle-related fatigue",
  "Lifestyle-related fatigue": "Lifestyle-related fatigue",
  insufficient_data: "Insufficient Data",
  "insufficient_data": "Insufficient Data",
};

const CONDITION_DESCRIPTIONS = {
  "Iron-deficiency anemia tendency": {
    short: "Low iron levels reducing oxygen-carrying capacity in blood",
    description: "Iron deficiency anemia occurs when your body doesn't have enough iron to produce hemoglobin, the protein in red blood cells that carries oxygen. Common causes include poor dietary intake, blood loss, or poor absorption. Symptoms include fatigue, weakness, pale skin, and shortness of breath.",
    symptoms: ["Fatigue", "Weakness", "Pale skin", "Shortness of breath", "Dizziness", "Cold hands/feet"],
    foods: ["Red meat", "Leafy greens", "Beans", "Iron-fortified cereals", " lentils"],
  },
  "Hypothyroidism tendency": {
    short: "Underactive thyroid gland slowing metabolism",
    description: "Hypothyroidism is a condition in which the thyroid gland doesn't produce enough thyroid hormones. This slows your metabolism. It's more common in women and can be caused by autoimmune disease, radiation therapy, or thyroid surgery.",
    symptoms: ["Fatigue", "Weight gain", "Cold intolerance", "Dry skin", "Hair loss", "Depression", "Slowed heart rate"],
    foods: ["Iodine-rich foods", "Selenium", "Zinc", "Lean protein"],
  },
  "Hyperthyroidism tendency": {
    short: "Overactive thyroid gland speeding up metabolism",
    description: "Hyperthyroidism is when the thyroid gland produces too much thyroid hormone, speeding up metabolism. Common causes include Graves' disease, toxic nodular goiter, or thyroiditis.",
    symptoms: ("Weight loss", "Rapid heartbeat", "Nervousness", "Heat intolerance", "Excessive sweating", "Tremor", "Sleep problems"),
    foods: ["Calorie-dense foods", "Calcium", "Vitamin D", "Avoid excess iodine"],
  },
  "PCOS/PCOD tendency": {
    short: "Hormonal imbalance affecting ovarian function",
    description: "Polycystic Ovary Syndrome (PCOS) is a hormonal disorder causing enlarged ovaries with small cysts. It affects menstruation, fertility, and appearance. Linked to insulin resistance and excess androgens (male hormones).",
    symptoms: ["Irregular periods", "Heavy bleeding", "Weight gain", "Excess hair", "Acne", "Darkening of skin", "Headaches"],
    foods: ["High-fiber foods", "Lean protein", "Anti-inflammatory foods", "Whole grains"],
  },
  "Lifestyle-related fatigue": {
    short: "Fatigue related to sleep, stress, or lack of exercise",
    description: "Lifestyle-related fatigue is caused by factors like poor sleep quality, chronic stress, sedentary lifestyle, or dehydration. It's not a disease but a reversible condition that improves with lifestyle changes.",
    symptoms: ["Tiredness", "Low energy", "Difficulty concentrating", "Morning fatigue", "General malaise"],
    foods: ["Hydration", "Balanced meals", "Regular eating schedule", "Avoid excessive caffeine"],
  },
  "Vitamin D deficiency": {
    short: "Insufficient vitamin D affecting bone health and immunity",
    description: "Vitamin D deficiency is common, especially in people with limited sun exposure. It affects calcium absorption, bone health, immune function, and mood.",
    symptoms: ["Fatigue", "Bone pain", "Muscle weakness", "Depression", "Hair loss"],
    foods: ["Sunlight exposure", "Fatty fish", "Egg yolks", "Fortified foods"],
  },
  "B12 deficiency": {
    short: "Low B12 affecting nerve function and blood",
    description: "Vitamin B12 is essential for nerve function and red blood cell production. Deficiency is common in vegetarians/vegans and people with digestive issues.",
    symptoms: ["Fatigue", "Numbness", "Tingling", "Memory issues", "Anemia"],
    foods: ["Meat", "Fish", "Eggs", "Dairy", "B12-fortified foods"],
  },
  "Iron deficiency (mild/pre-latent)": {
    short: "Early stage iron depletion without full anemia",
    description: "This is an early stage of iron deficiency where iron stores are low but hemoglobin is still normal. It's easier to reverse with dietary changes before it progresses to anemia.",
    symptoms: ["Mild fatigue", "Reduced exercise tolerance", "Brittle nails", "Slight hair loss"],
    foods: ["Red meat", "Beans", "Lentils", "Spinach", "Vitamin C helps absorption"],
  },
  "PMS / Premenstrual Syndrome": {
    short: "Physical and emotional symptoms before menstruation",
    description: "PMS occurs in the days before menstruation and includes both physical and emotional symptoms caused by hormonal fluctuations. Severity varies widely.",
    symptoms: ["Mood swings", "Bloating", "Breast tenderness", "Fatigue", "Cravings", "Irritability", "Acne"],
    foods: ["Complex carbs", "Magnesium-rich foods", "Limit salt/sugar/caffeine"],
  },
  "Stress-related fatigue": {
    short: "Chronic stress depleting mental and physical energy",
    description: "Prolonged stress floods the body with cortisol, depleting energy reserves and causing chronic tiredness. Managing stress through lifestyle changes is essential for recovery.",
    symptoms: ["Chronic tiredness", "Sleep issues", "Irritability", "Difficulty concentrating", "Muscle tension"],
    foods: ["Adaptogenic foods", "Magnesium", "B-complex vitamins", "Herbal teas"],
  },
  "Sleep architecture disruption": {
    short: "Poor sleep quality affecting daytime function",
    description: "Sleep disruption means your sleep cycles are broken, reducing restorative sleep. Common causes include stress, irregular schedules, screen time before bed, or sleep disorders.",
    symptoms: ["Unrefreshing sleep", "Daytime drowsiness", "Memory issues", "Mood changes"],
    foods: ["Avoid caffeine after 2pm", "Limit alcohol", "Light dinner", "Tryptophan-rich foods"],
  },
  "Mild dehydration": {
    short: "Insufficient fluid affecting all body functions",
    description: "Even mild dehydration (1-2% body weight loss) can affect energy, mood, cognitive function, and physical performance. Common in people who don't drink enough water.",
    symptoms: ["Fatigue", "Headache", "Dry skin", "Dizziness", "Dark urine", "Reduced concentration"],
    foods: ["Water-rich foods", "Electrolyte drinks", "Cucumber", "Watermelon"],
  },
  "Lifestyle-related weight fluctuation": {
    short: "Weight changes from diet/exercise patterns",
    description: "Weight fluctuations are often due to lifestyle factors like dietary patterns, exercise frequency, stress, and sleep quality rather than medical conditions.",
    symptoms: ["Weight changes", "Energy swings", "Food cravings", "Digestive Changes"],
    foods: ["Regular meals", "High-fiber foods", "Lean protein", "Limit processed foods"],
  },
  "Subclinical hypothyroidism": {
    short: "Mildly abnormal thyroid function without clear symptoms",
    description: "Subclinical hypothyroidism shows slightly abnormal TSH levels without clear symptoms. It may progress to clinical hypothyroidism and often needs monitoring.",
    symptoms: ["Mild fatigue", "Subtle weight changes", "Slight cold intolerance", "Dry skin"],
    foods: ["Selenium-rich foods", "Iodine (if deficient)", "Anti-inflammatory foods"],
  },
  "Endometriosis": {
    short: "Uterine tissue growth outside uterus causing pain",
    description: "Endometriosis occurs when tissue similar to the uterine lining grows outside the uterus, causing chronic pain, heavy periods, and fertility issues. It's a progressive condition that often goes undiagnosed for years.",
    symptoms: ["Severe menstrual pain", "Heavy bleeding", "Chronic pelvic pain", "Fatigue", "Pain during intercourse", "Infertility"],
    foods: ["Omega-3 rich foods", "Fiber", "Lean protein", "Anti-inflammatory foods", "Avoid processed foods"],
  },
  "Menorrhagia (Heavy bleeding)": {
    short: "Excessively heavy or prolonged menstrual bleeding",
    description: "Menorrhagia is characterized by abnormally heavy or prolonged menstrual bleeding. It can be caused by hormonal imbalances, uterine fibroids, clotting disorders, or other conditions. It often leads to anemia.",
    symptoms: ["Heavy flow", "Passing large clots", "Fatigue", "Iron deficiency", "Cramping", "Anemia"],
    foods: ["Iron-rich foods", "Vitamin C", "Vitamin K", "Leafy greens", "Lean protein"],
  },
  "Amenorrhea (No periods)": {
    short: "Absence of menstrual periods",
    description: "Amenorrhea is the absence of menstrual periods. It can be caused by pregnancy, breastfeeding, extreme weight loss, excessive exercise, stress, or medical conditions like PCOS or thyroid disorders.",
    symptoms: ["No periods", "Weight changes", "Hair growth", "Acne", "Mood changes", "Fertility issues"],
    foods: ["Balanced nutrition", "Healthy fats", "Iron-rich foods", "Avoid extreme dieting"],
  },
  "Uterine Fibroids": {
    short: "Non-cancerous uterine growths causing symptoms",
    description: "Uterine fibroids are non-cancerous growths in the uterus that can cause heavy bleeding, pelvic pain, pressure symptoms, and fertility issues. They're common in women of reproductive age.",
    symptoms: ["Heavy bleeding", "Pelvic pressure", "Frequent urination", "Back pain", "Fertility issues", "Pain during intercourse"],
    foods: ["Fiber-rich foods", "Lean protein", "Green vegetables", "Limit red meat", "Avoid processed foods"],
  },
  "PMDD (Severe PMS)": {
    short: "Severe premenstrual symptoms affecting daily life",
    description: "Premenstrual Dysphoric Disorder (PMDD) is a severe form of PMS that causes significant emotional and physical symptoms in the luteal phase. It can severely impact daily functioning and quality of life.",
    symptoms: ["Severe mood swings", "Depression", "Anxiety", "Irritability", "Fatigue", "Bloating", "Breast tenderness"],
    foods: ["Complex carbs", "Magnesium", "Vitamin B6", "Avoid caffeine", "Limit sugar", "Regular meals"],
  },
  "Insulin Resistance": {
    short: "Cells not responding properly to insulin",
    description: "Insulin resistance occurs when cells become less responsive to insulin, leading to elevated blood sugar. It's closely linked to PCOS, weight gain, and increased risk of type 2 diabetes.",
    symptoms: ["Weight gain", "Fatigue", "Cravings", "Brain fog", "Dark skin patches", "Irregular periods"],
    foods: ["High-fiber foods", "Lean protein", "Whole grains", "Healthy fats", "Avoid refined carbs", "Limit sugar"],
  },
  "Vitamin B Complex deficiency": {
    short: "Low B vitamins affecting energy and mood",
    description: "B vitamin deficiency (B1, B2, B3, B5, B6, B7, B9, B12) can cause fatigue, mood changes, nerve problems, and anemia. B-complex is essential for energy metabolism and nervous system function.",
    symptoms: ["Fatigue", "Mood changes", "Nerve issues", "Memory problems", "Hair loss", "Skin issues"],
    foods: ["Whole grains", "Eggs", "Dairy", "Leafy greens", "Legumes", "Meat", "Fortified foods"],
  },
  "Magnesium deficiency": {
    short: "Low magnesium causing muscle and sleep issues",
    description: "Magnesium is essential for muscle function, nerve transmission, energy production, and sleep. Deficiency is common and can cause cramps, fatigue, anxiety, and poor sleep quality.",
    symptoms: ["Muscle cramps", "Fatigue", "Anxiety", "Poor sleep", "Headaches", "Irregular heartbeat"],
    foods: ["Nuts", "Seeds", "Leafy greens", "Dark chocolate", "Avocados", "Bananas", "Legumes"],
  },
  "Zinc deficiency": {
    short: "Low zinc affecting immunity and hormones",
    description: "Zinc is crucial for immune function, hormone production, wound healing, and protein synthesis. Deficiency can cause hair loss, skin issues, frequent infections, and hormonal imbalances.",
    symptoms: ["Hair loss", "Frequent infections", "Skin problems", "Loss of appetite", "Delayed healing", "Mood changes"],
    foods: ["Oysters", "Red meat", "Poultry", "Beans", "Nuts", "Dairy", "Whole grains"],
  },
  "Perimenopause": {
    short: "Hormonal transition period before menopause",
    description: "Perimenopause is the transition period leading to menopause, typically in the 40s. It involves fluctuating hormone levels causing irregular periods, hot flashes, mood changes, and other symptoms.",
    symptoms: ["Irregular periods", "Hot flashes", "Night sweats", "Mood changes", "Sleep issues", "Weight changes"],
    foods: ["Phytoestrogen foods", "Calcium", "Vitamin D", "Fiber", "Avoid triggers", "Regular meals"],
  },
};

function getConditionDesc(name) {
  const key = String(name).toLowerCase().trim();
  for (const [descKey, desc] of Object.entries(CONDITION_DESCRIPTIONS)) {
    if (descKey.toLowerCase().includes(key) || key.includes(descKey.toLowerCase().split(" ")[0])) {
      return desc;
    }
  }
  return CONDITION_DESCRIPTIONS[key] || null;
}

const SPECIALTY_MAP = {
  iron_deficiency_anemia: "Hematologist / General Physician",
  hypothyroidism: "Endocrinologist",
  hyperthyroidism: "Endocrinologist",
  pcos: "Gynecologist",
  pcod: "Gynecologist",
  endometriosis_tendency: "Gynecologist",
};

const LAB_ICONS = {
  lab: "🧪",
  doctor: "👩‍⚕️",
  tracking: "📈",
  diet: "🥗",
  lifestyle: "🌿",
};

function getIndicator(confidence) {
  if (confidence >= 0.65) return { label: "High", cls: "high", icon: "🔴" };
  if (confidence >= 0.35) return { label: "Medium", cls: "medium", icon: "🟠" };
  return { label: "Low", cls: "low", icon: "🟡" };
}

function getConditionRank(tendency, allConditions) {
  const sorted = [...allConditions].sort((a, b) => b.confidence - a.confidence);
  return sorted.findIndex((c) => c.tendency === tendency) + 1;
}

function RankingTable({ conditions }) {
  const sorted = [...conditions].sort((a, b) => b.confidence - a.confidence);

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="results-table">
        <thead>
          <tr>
            <th style={{ width: "50px" }}>Rank</th>
            <th>Condition</th>
            <th style={{ minWidth: "220px" }}>Confidence</th>
            <th>Indicator</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, idx) => {
            const indicator = getIndicator(item.confidence);
            const percent = Math.round(item.confidence * 100);

            return (
              <tr key={item.tendency}>
                <td>
                  <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
                </td>
                <td>
                  <span className="condition-name capitalize">
                    {CONDITION_LABELS[item.tendency] || item.tendency.replace(/_/g, " ")}
                  </span>
                </td>
                <td>
                  <div className="confidence-cell">
                    <div className="conf-track">
                      <div
                        className={`conf-fill ${indicator.cls}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="conf-value">{percent}%</span>
                  </div>
                </td>
                <td>
                  <span className={`indicator-badge ${indicator.cls}`}>
                    {indicator.icon} {indicator.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RecommendationCard({ type, text }) {
  const icon = LAB_ICONS[type] || "📋";
  const titles = {
    lab: "Lab Test Suggestion",
    doctor: "Consult a Specialist",
    tracking: "Track & Monitor",
    diet: "Dietary Recommendation",
    lifestyle: "Lifestyle Adjustment",
  };

  return (
    <div className="recommendation-card">
      <div className={`rec-icon ${type}`}>{icon}</div>
      <div className="rec-text">
        <div className="rec-title">{titles[type] || "Recommendation"}</div>
        <div className="rec-desc">{text}</div>
      </div>
    </div>
  );
}

function MinorFactorCard({ item }) {
  const desc = getConditionDesc(item.name);
  return (
    <div className="card" style={{ border: "1px solid var(--color-border-subtle)", background: "var(--color-bg-secondary)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
        <strong style={{ fontSize: "var(--text-sm)" }}>{item.name}</strong>
        <span className="indicator-badge medium" style={{ background: "var(--color-primary)", color: "white" }}>
          {Math.round((item.confidence || 0) * 100)}%
        </span>
      </div>
      {desc && (
        <p style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--text-xs)", fontStyle: "italic", color: "var(--color-text-secondary)" }}>
          {desc.short}
        </p>
      )}
      <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
        {item.reasoning || (desc ? String(desc.description).substring(0, 120) + "..." : "")}
      </p>
      {desc && desc.foods && desc.foods.length > 0 && (
        <p style={{ margin: "var(--space-2) 0 0 0", fontSize: "var(--text-xs)", color: "var(--color-success)" }}>
          🥗 Consider: {desc.foods.slice(0, 4).join(", ")}
        </p>
      )}
    </div>
  );
}

export function ResultDashboardPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { userId } = useProfileStore();
  const { latestOutput } = useScreeningStore();
  const [progression, setProgression] = useState(null);

  useEffect(() => {
    async function loadProgression() {
      if (!userId) return;
      try {
        const data = await fetchRiskProgression(userId);
        setProgression(data);
      } catch {
        setProgression(null);
      }
    }
    loadProgression();
  }, [userId]);

  if (!latestOutput) {
    return (
      <div className="panel panel-hero">
        <h2>No Screening Result Found</h2>
        <p>Please complete the symptom check-in and lab upload first.</p>
        <div className="button-row" style={{ justifyContent: "center", marginTop: "var(--space-6)" }}>
          <button className="btn btn-primary" onClick={() => navigate("/checkin")}>
            Start Check-in
          </button>
        </div>
      </div>
    );
  }

  if (!latestOutput || !latestOutput.primary_tendency) {
    return (
      <div className="panel panel-hero">
        <h2>No Screening Result Found</h2>
        <p>Raw output: {JSON.stringify(latestOutput)}</p>
        <button className="btn btn-primary" onClick={() => navigate("/checkin")}>
          Start Check-in
        </button>
      </div>
    );
  }
  
  console.log('latestOutput from store:', JSON.stringify(latestOutput, null, 2));

  const primary = {
    tendency: latestOutput?.primary_tendency || "Insufficient Data",
    confidence: Number(latestOutput?.confidence || 0),
  };
  const secondary = {
    tendency: latestOutput?.secondary_tendency || "Insufficient Data",
    confidence: Number(latestOutput?.secondary_confidence || 0),
  };
  
  const allConditions = [primary, secondary].filter(
    (c) => c.tendency && c.tendency !== "insufficient_data" && String(c.tendency).toLowerCase() !== "insufficient data"
  );

function getConditionDesc(name) {
  if (!name) return null;
  const key = String(name).toLowerCase().trim();
  
  const KEYWORD_MAP = {
    "stress": "Stress-related fatigue",
    "stress-induced": "Stress-related fatigue",
    "poor sleep": "Sleep architecture disruption",
    "sleep": "Sleep architecture disruption",
    "sedentary": "Lifestyle-related fatigue",
    "dehydration": "Mild dehydration",
    "pms": "PMDD (Severe PMS)",
    "premenstrual": "PMDD (Severe PMS)",
    "pmdd": "PMDD (Severe PMS)",
    "vitamin d": "Vitamin D deficiency",
    "b12": "B12 deficiency",
    "b complex": "Vitamin B Complex deficiency",
    "vitamin b": "Vitamin B Complex deficiency",
    "magnesium": "Magnesium deficiency",
    "zinc": "Zinc deficiency",
    "iron deficiency": "Iron deficiency (mild/pre-latent)",
    "weight fluctuation": "Lifestyle-related weight fluctuation",
    "general fatigue": "Lifestyle-related fatigue",
    "lifestyle": "Lifestyle-related fatigue",
    "insulin": "Insulin Resistance",
    "endometriosis": "Endometriosis",
    "fibroid": "Uterine Fibroids",
    "menorrhagia": "Menorrhagia (Heavy bleeding)",
    "heavy bleeding": "Menorrhagia (Heavy bleeding)",
    "amenorrhea": "Amenorrhea (No periods)",
    "no period": "Amenorrhea (No periods)",
    "perimenopause": "Perimenopause",
    "menopause": "Perimenopause",
  };
  
  for (const [keyword, descKey] of Object.entries(KEYWORD_MAP)) {
    if (key.includes(keyword)) {
      const desc = CONDITION_DESCRIPTIONS[descKey];
      if (desc) return desc;
    }
  }
  
  for (const [descKey, desc] of Object.entries(CONDITION_DESCRIPTIONS)) {
    if (descKey.toLowerCase().includes(key) || key.includes(descKey.toLowerCase().split(" ")[0])) {
      return desc;
    }
  }
  return CONDITION_DESCRIPTIONS[key] || null;
}

const allContributions = (latestOutput.symptom_contributions || [])
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 8);

  const confoundFlags = latestOutput.confounding_flags || [];
  const recommendations = latestOutput.actionable_recommendations || latestOutput.recommendations || [];
  const minorTendencies = latestOutput.minor_tendencies || [];
  const relatedCauses = latestOutput.related_causes || [];
  const minorRelatedFactors = latestOutput.minor_related_factors || [];

  const recTypeMap = {
    "Get CBC": "lab",
    "Get TSH": "lab",
    "Discuss": "doctor",
    "Consult": "doctor",
    "Track": "tracking",
    "Diet": "diet",
    "lifestyle": "lifestyle",
  };

  function getRecType(text) {
    for (const [key, val] of Object.entries(recTypeMap)) {
      if (text.toLowerCase().includes(key.toLowerCase())) return val;
    }
    return "lab";
  }

  return (
    <>
      {/* Hero */}
      <div className="panel panel-hero" style={{ marginBottom: "var(--space-6)" }}>
        <h1>Your Screening Results</h1>
        <p>
          Based on your symptoms and profile, here are the hormonal tendencies identified.
          <br />
          <strong>Session:</strong> {sessionId}
        </p>
      </div>

      {/* Condition Ranking */}
      <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="panel-header">
          <div>
            <h2>Condition Ranking</h2>
            <p>Ranked by confidence score — higher rank means stronger screening signal</p>
          </div>
        </div>

        <RankingTable conditions={allConditions} />

        {/* Primary Result Highlight */}
        <div
          style={{
            marginTop: "var(--space-6)",
            padding: "var(--space-5)",
            background: "var(--color-primary-light)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-primary-muted)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)", fontWeight: 600, marginBottom: "var(--space-2)" }}>
            Primary Screening Tendency
          </p>
          <h2 style={{ color: "var(--color-primary)", marginBottom: "var(--space-2)" }}>
            {CONDITION_LABELS[primary.tendency] || primary.tendency}
          </h2>
          <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
            {Math.round(primary.confidence * 100)}%
          </div>
          <p style={{ marginTop: "var(--space-2)" }}>
            {primary.confidence >= 0.65
              ? "High signal — strongly consider clinical follow-up"
              : primary.confidence >= 0.35
              ? "Moderate signal — monitoring and labs recommended"
              : "Low signal — continue tracking symptoms over time"}
          </p>

          {/* Primary Condition Description */}
          {(() => {
            const primaryDesc = getConditionDesc(primary.tendency);
            if (!primaryDesc) return null;
            return (
              <div style={{ marginTop: "var(--space-4)", textAlign: "left", padding: "var(--space-4)", background: "rgba(255,255,255,0.5)", borderRadius: "var(--radius-md)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", fontStyle: "italic", marginBottom: "var(--space-2)" }}>
                  {primaryDesc.short}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: "var(--space-2)" }}>
                  {primaryDesc.description}
                </p>
                {primaryDesc.foods && primaryDesc.foods.length > 0 && (
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--color-success)" }}>
                    🥗 Consider: {primaryDesc.foods.join(", ")}
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Minor Tendencies */}
      <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="panel-header">
          <div>
            <h2>Also Consider (Common Factors)</h2>
            <p>Informational contributors that may influence symptoms without being primary drivers</p>
          </div>
        </div>

        {minorTendencies.length > 0 ? (
          <div className="doctors-grid">
            {minorTendencies.map((item, idx) => (
              <MinorFactorCard key={`${item.name}-${idx}`} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-muted">No additional common contributing factors were detected above reporting threshold.</p>
        )}
      </section>

      {/* Symptom Contributions & Related Analysis */}
      <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="panel-header">
          <div>
            <h2>Why This Result?</h2>
            <p>What your symptoms relate to and minor factors to consider</p>
          </div>
        </div>

        {/* Primary Reason */}
        {allContributions.length > 0 && (
          <>
            <div className="section-title">
              <h3>🔬 Main Contributing Factors</h3>
            </div>
            <ul className="contribution-list">
              {allContributions.slice(0, 5).map((item, idx) => (
                <li key={`main-${idx}`} className="contribution-item">
                  <div>
                    <span className="contribution-symptom capitalize">
                      {String(item.symptom).replace(/_/g, " ")}
                    </span>
                    <span className="contribution-arrow"> → </span>
                    <span className="contribution-condition capitalize">
                      {CONDITION_LABELS[item.condition] || String(item.condition).replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="contribution-score">{Math.round((item.contribution || 0) * 100)}%</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Related Causes with % */}
        {relatedCauses.length > 0 && (
          <>
            <div className="section-title">
              <h3>📊 Related Causes (% Match)</h3>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
              {relatedCauses.map((rc, idx) => (
                <span key={`rc-${idx}`} className="indicator-badge medium" style={{ fontSize: "var(--text-xs)" }}>
                  {rc.name}: {rc.match}%
                </span>
              ))}
            </div>
          </>
        )}

        {/* Minor Related Factors with % and Descriptions */}
        {minorRelatedFactors.length > 0 && (
          <>
            <div className="section-title">
              <h3>🩺 Minor Related Problems/Diseases</h3>
            </div>
            {minorRelatedFactors.map((mr, idx) => {
              const desc = getConditionDesc(mr.name);
              return (
                <div key={`mr-${idx}`} style={{ 
                  marginBottom: "var(--space-3)", 
                  padding: "var(--space-3)", 
                  borderRadius: "var(--radius-md)",
                  borderLeft: "3px solid var(--color-warning)",
                  background: "var(--color-bg-secondary)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                    <span className="contribution-symptom capitalize" style={{ color: "var(--color-warning)", fontWeight: 600 }}>
                      {String(mr.name).replace(/_/g, " ")}
                    </span>
                    <span className="indicator-badge medium" style={{ background: "var(--color-warning)", color: "white" }}>
                      {mr.match}%
                    </span>
                  </div>
                  {desc && (
                    <>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", fontStyle: "italic", marginBottom: "var(--space-2)" }}>
                        {desc.short}
                      </p>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                        {String(desc.description).substring(0, 180)}...
                      </p>
                      {desc.foods && desc.foods.length > 0 && (
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-success)", marginTop: "var(--space-2)" }}>
                          🥗 Consider: {desc.foods.slice(0, 4).join(", ")}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>
              These are common reversible factors. Addressing them may improve your overall wellbeing.
            </p>
          </>
        )}

        {/* Confounding Factors */}
        {confoundFlags.length > 0 && (
          <>
            <div className="section-title">
              <h3>⚡ Contextual Factors</h3>
            </div>
            <div className="confound-tags">
              {confoundFlags.map((flag) => (
                <span key={flag} className="confound-tag">
                  {String(flag).replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </>
        )}

        {allContributions.length === 0 && relatedCauses.length === 0 && minorRelatedFactors.length === 0 && (
          <p className="text-muted">No significant symptom contributions found.</p>
        )}
      </section>

      {/* Recommendations */}
      <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="panel-header">
          <div>
            <h2>Recommended Next Steps</h2>
            <p>Evidence-based suggestions based on your screening profile</p>
          </div>
        </div>

        {recommendations.length > 0 ? (
          recommendations.map((item, idx) => (
            <RecommendationCard key={idx} type={getRecType(item)} text={item} />
          ))
        ) : (
          <p className="text-muted">No specific recommendations available.</p>
        )}
      </section>

      {/* Risk Progression */}
      {progression && (
        <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
          <div className="panel-header">
            <div>
              <h2>Risk Progression</h2>
              <p>Your screening history over time</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{progression.total_sessions || 0}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.round((progression.confidence_change || 0) * 100)}%</div>
              <div className="stat-label">Confidence Change</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{progression.trend_points?.length || 0}</div>
              <div className="stat-label">Data Points</div>
            </div>
          </div>

          <div className="timeline-chart">
            {(progression.trend_points || []).map((point) => (
              <div key={point.sessionId} className="bar-wrap">
                <div
                  className="bar"
                  style={{ height: `${Math.max(8, Math.round((point.confidence || 0) * 140))}px` }}
                />
                <span className="bar-label">{new Date(point.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <div className="disclaimer">
        <span className="disclaimer-icon">⚠️</span>
        <div>
          <strong>This is a screening result, not a medical diagnosis.</strong>
          <br />
          The information provided is based on symptom patterns and optional lab values. It does not replace professional medical evaluation, examination, or testing. Always consult a qualified healthcare provider for proper diagnosis and treatment.
        </div>
      </div>

      {/* Find Doctors CTA */}
      <div className="doctor-cta-banner">
        <div className="doctor-cta-banner-icon">👩‍⚕️</div>
        <div className="doctor-cta-banner-text">
          <h4>Ready to consult a specialist?</h4>
          <p>
            Based on your screening result, we recommend seeing a{" "}
            <strong>
              {SPECIALTY_MAP[primary.tendency] || "women's health specialist"}
            </strong>
            . Find verified doctors near you.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/doctors", { state: { condition: primary.tendency } })}
        >
          Find Doctors →
        </button>
      </div>

      {/* Navigation */}
      <div className="button-row" style={{ marginTop: "var(--space-6)" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/checkin")}>
          ← New Check-in
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-secondary" onClick={() => navigate(`/timeline/${userId}`)}>
          📊 Timeline
        </button>
        <Link className="btn btn-accent" to={`/report/${sessionId}`}>
          📄 Report
        </Link>
      </div>
    </>
  );
}
