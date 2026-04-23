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
  normal: "Good Health",
  "Good Health": "Good Health",
  normal_health: "Good Health",
  "Normal Health": "Good Health",
  insufficient_data: "Insufficient Data",
  "Insufficient Data": "Insufficient Data",
};

const CONDITION_DESCRIPTIONS = {
  "Good Health": {
    short: "Your health indicators appear good",
    description: "Based on your symptoms and lab values, your health indicators are within normal ranges. Continue maintaining a healthy lifestyle with balanced diet, regular exercise, adequate sleep, and regular check-ups with your healthcare provider.",
    symptoms: ["No significant symptoms reported"],
    foods: ["Balanced diet", "Regular exercise", "Adequate sleep", "Stay hydrated"],
    precautions: ["Continue regular health check-ups", "Maintain healthy lifestyle", "Monitor any new symptoms"],
  },
  "Normal Health": {
    short: "Your health indicators appear normal",
    description: "Based on your symptoms and lab values, your health indicators are within normal ranges. Continue maintaining a healthy lifestyle with balanced diet, regular exercise, adequate sleep, and regular check-ups with your healthcare provider.",
    symptoms: ["No significant symptoms reported"],
    foods: ["Balanced diet", "Regular exercise", "Adequate sleep", "Stay hydrated"],
    precautions: ["Continue regular health check-ups", "Maintain healthy lifestyle", "Monitor any new symptoms"],
  },
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

function ConditionDropdown({ condition, confidence, isPrimary, aiDetails }) {
  const [expanded, setExpanded] = useState(false);
  const isGoodHealth = (name) => name === "Good Health" || name === "Normal Health" || (name && name.toLowerCase().includes("good"));
  const fallbackDesc = getConditionDesc(condition);
  const details = aiDetails && typeof aiDetails === 'object' && !isGoodHealth(condition) ? aiDetails : fallbackDesc;

  return (
    <div style={{ 
      marginTop: "var(--space-3)", 
      borderRadius: "var(--radius-md)", 
      border: expanded ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
      overflow: "hidden",
      background: "white",
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          padding: "var(--space-3) var(--space-4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--color-text)",
        }}
      >
        <span>
          {isPrimary ? "🔍 " : "📌 "}
          {condition.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          <span style={{ marginLeft: 8, color: "var(--color-primary)", fontWeight: 700 }}>
            {Math.round((confidence || 0) * 100)}%
          </span>
        </span>
        <span style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          ▼
        </span>
      </button>
      
      {expanded && details && (
        <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--color-border)", background: "var(--color-bg-secondary)" }}>
          {details.short && (
            <p style={{ fontSize: "var(--text-xs)", fontStyle: "italic", color: "var(--color-text-secondary)", marginBottom: "var(--space-2)" }}>
              {details.short}
            </p>
          )}
          
          {details.description && (
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: "var(--space-3)" }}>
              {details.description}
            </p>
          )}
          
          {details.symptoms && details.symptoms.length > 0 && (
            <div style={{ marginBottom: "var(--space-3)" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-warning)", marginBottom: "var(--space-1)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ⚠️ Symptoms
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {details.symptoms.slice(0, 8).map((s, i) => (
                  <span key={i} style={{ padding: "4px 10px", background: "#fef3c7", borderRadius: 999, fontSize: "var(--text-xs)", color: "#92400e" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {details.foods && details.foods.length > 0 && (
            <div style={{ marginBottom: "var(--space-3)" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-success)", marginBottom: "var(--space-1)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🥗 Foods to Consider
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {details.foods.slice(0, 6).map((f, i) => (
                  <span key={i} style={{ padding: "4px 10px", background: "#d1fae5", borderRadius: 999, fontSize: "var(--text-xs)", color: "#065f46" }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {details.precautions && details.precautions.length > 0 && (
            <div>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-primary)", marginBottom: "var(--space-1)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                💊 Precautions
              </div>
              <ul style={{ margin: 0, paddingLeft: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                {details.precautions.slice(0, 4).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ResultDashboardPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { userId } = useProfileStore();
  const { latestOutput, conditionDetails } = useScreeningStore();
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
    (c) => c.tendency && 
           c.tendency !== "insufficient_data" && 
           String(c.tendency).toLowerCase() !== "insufficient data" &&
           c.tendency !== "Good Health" &&
           c.tendency !== "Normal Health"
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
  <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>
    
    {/* ── HEADER ── */}
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.02em' }}>
        Your Screening Results
      </h1>
      <p style={{ color: '#64748B', fontSize: '14px' }}>
        Session ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{sessionId}</span>
      </p>
    </div>

    {/* ── PRIMARY RESULT HIGHLIGHT ── */}
    <section style={{ 
      maxWidth: '800px', 
      margin: '0 auto 32px', 
      background: '#FFFFFF', 
      borderRadius: '32px', 
      padding: '40px',
      border: '1px solid #EDE9FE',
      boxShadow: '0 10px 30px rgba(124, 111, 205, 0.08)',
      textAlign: 'center',
      position: 'relative'
    }}>
      <div style={{ 
        display: 'inline-flex', 
        padding: '8px 16px', 
        background: '#F5F3FF', 
        borderRadius: '999px', 
        color: '#7C6FCD', 
        fontSize: '12px', 
        fontWeight: 800, 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em',
        marginBottom: '20px',
        border: '1px solid #7C6FCD20'
      }}>
        {primary.tendency === "Good Health" || primary.tendency === "Normal Health" || primary.tendency?.toLowerCase().includes("good") ? "Health Status" : "Primary Tendency Detected"}
      </div>

      <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#2A1F4E', marginBottom: '16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {CONDITION_LABELS[primary.tendency] || primary.tendency}
      </h2>

      {primary.tendency === "Good Health" || primary.tendency === "Normal Health" || primary.tendency?.toLowerCase().includes("good") ? (
        <div style={{ fontSize: "32px", fontWeight: 800, color: "#10b981", marginBottom: '24px' }}>
          ✓ All Clear
        </div>
      ) : (
        <div style={{ marginBottom: '24px' }}>
           <div style={{ fontSize: "56px", fontWeight: 900, color: "#7C6FCD", lineHeight: 1 }}>
            {Math.round(primary.confidence * 100)}%
          </div>
          <div style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600, marginTop: '4px' }}>Analysis Confidence Match</div>
        </div>
      )}

      <div style={{ 
        padding: '24px', 
        background: '#F8FAFC', 
        borderRadius: '24px', 
        border: '1px solid #E2E8F0',
        textAlign: 'left',
        maxWidth: '640px',
        margin: '0 auto'
      }}>
        <p style={{ fontWeight: 700, color: '#2A1F4E', marginBottom: '12px', fontSize: '16px' }}>
          {primary.tendency === "Good Health" || primary.tendency === "Normal Health" || primary.tendency?.toLowerCase().includes("good")
            ? "Great news! Your health indicators appear normal."
            : primary.confidence >= 0.65
              ? "Strong Signal: We recommend a clinical follow-up soon."
              : primary.confidence >= 0.35
                ? "Moderate Signal: Consider monitoring these symptoms."
                : "Low Signal: No immediate concern, but keep tracking."}
        </p>
        
        {(() => {
          const primaryDesc = getConditionDesc(primary.tendency);
          if (!primaryDesc) return null;
          return (
            <>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, marginBottom: '16px' }}>
                {primaryDesc.description}
              </p>
              {primaryDesc.foods?.length > 0 && (
                <div style={{ fontSize: "13px", color: "#10b981", fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>🥗</span> Recommended Foods: {primaryDesc.foods.join(", ")}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Condition Dropdown Viewers */}
      <div style={{ marginTop: '32px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#94A3B8', marginBottom: '12px', textTransform: 'uppercase' }}>Detailed Insights</h3>
        <ConditionDropdown condition={primary.tendency} confidence={primary.confidence} isPrimary={true} aiDetails={conditionDetails?.primary} />
        {secondary.tendency && secondary.tendency !== "insufficient_data" && !(secondary.tendency === "Good Health" || secondary.tendency === "Normal Health") && (
          <ConditionDropdown condition={secondary.tendency} confidence={secondary.confidence} isPrimary={false} aiDetails={conditionDetails?.secondary} />
        )}
      </div>
    </section>

    {/* ── CONDITION RANKING ── */}
    <section style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '28px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#0F172A' }}>📊 Condition Ranking</h3>
        </div>
        <div style={{ padding: '16px' }}>
          <RankingTable conditions={allConditions} />
        </div>
      </div>
    </section>

    {/* ── MINOR TENDENCIES (ALSO CONSIDER) ── */}
    <section style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '28px', padding: '32px', border: '1px solid #E2E8F0' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#2A1F4E' }}>Also Consider (Common Factors)</h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>Informational contributors that may influence your current symptoms</p>
        </div>

        {minorTendencies.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {minorTendencies.map((item, idx) => (
              <MinorFactorCard key={idx} item={item} />
            ))}
          </div>
        ) : (
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>No additional contributing factors detected above reporting threshold.</p>
        )}
      </div>
    </section>

    {/* ── WHY THIS RESULT? (ANALYSIS) ── */}
    <section style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '28px', padding: '32px', border: '1px solid #E2E8F0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: '#2A1F4E' }}>Why This Result?</h2>
        
        {primary.tendency === "Good Health" || primary.tendency === "Normal Health" || primary.tendency?.toLowerCase().includes("good") ? (
          <div>
            <div style={{ marginBottom: '20px', padding: '20px', background: '#F0FDF4', borderRadius: '16px', border: '1px solid #BBF7D0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#166534', marginBottom: '12px' }}>✓ Your health indicators are within normal ranges</h4>
              <p style={{ fontSize: '13px', color: '#15803D', lineHeight: 1.6 }}>
                Based on your symptom check-in and lab values (if provided), no significant hormonal patterns were detected that indicate concern. 
                Your body's hormonal function appears to be operating within expected ranges.
              </p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '12px', letterSpacing: '0.08em', fontWeight: 700 }}>What contributed to this result?</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px' }}>
                  <span style={{ fontSize: '16px' }}>✓</span>
                  <span style={{ fontSize: '13px', color: '#475569' }}>Normal severity levels across all checked symptoms</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px' }}>
                  <span style={{ fontSize: '16px' }}>✓</span>
                  <span style={{ fontSize: '13px', color: '#475569' }}>No abnormal patterns in lifestyle factors</span>
                </div>
                {latestOutput?.labValues && Object.keys(latestOutput.labValues).length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px' }}>
                    <span style={{ fontSize: '16px' }}>✓</span>
                    <span style={{ fontSize: '13px', color: '#475569' }}>Lab values within normal reference ranges</span>
                  </div>
                )}
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
              Remember: Continue maintaining a healthy lifestyle with balanced diet, regular exercise, adequate sleep, and regular check-ups with your healthcare provider.
            </p>
          </div>
        ) : (
          <>
            {allContributions.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '16px', letterSpacing: '0.08em', fontWeight: 700 }}>Key Symptom Drivers</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {allContributions.slice(0, 5).map((item, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', 
                      background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' 
                    }}>
                      <span style={{ fontWeight: 600, color: '#475569', textTransform: 'capitalize', fontSize: '14px' }}>
                        {String(item.symptom).replace(/_/g, " ")}
                      </span>
                      <span style={{ fontWeight: 800, color: '#7C6FCD', fontSize: '14px' }}>
                        {Math.round((item.contribution || 0) * 100)}% Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedCauses.length > 0 && (
              <div>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '12px', fontWeight: 700 }}>Associated Patterns</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {relatedCauses.map((rc, idx) => (
                    <span key={idx} style={{ padding: '8px 14px', background: '#F1F5F9', color: '#475569', borderRadius: '10px', fontSize: '12px', fontWeight: 700, border: '1px solid #E2E8F0' }}>
                      {rc.name} ({rc.match}%)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>

    {/* ── NEXT STEPS & PROGRESSION ── */}
    <section style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '28px', padding: '32px', border: '1px solid #E2E8F0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: '#2A1F4E' }}>Recommended Next Steps</h2>
        {recommendations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendations.map((item, idx) => (
              <RecommendationCard key={idx} type={getRecType(item)} text={item} />
            ))}
          </div>
        ) : (
          <p style={{ color: '#94A3B8' }}>No specific recommendations available at this time.</p>
        )}
      </div>
    </section>

{progression && (
  <section className="panel" style={{ marginBottom: "var(--space-4)", maxWidth: '800px', margin: '0 auto 32px' }}>
    <div className="panel-header">
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#2A1F4E' }}>Risk Progression</h2>
        <p style={{ fontSize: '14px', color: '#64748B' }}>Your screening history over time</p>
      </div>
    </div>

    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
      <div className="stat-card" style={{ padding: '20px', background: '#F8FAFC', borderRadius: '20px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
        <div className="stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#7C6FCD' }}>{progression.total_sessions || 0}</div>
        <div className="stat-label" style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Total Sessions</div>
      </div>
      <div className="stat-card" style={{ padding: '20px', background: '#F8FAFC', borderRadius: '20px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
        <div className="stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#7C6FCD' }}>{Math.round((progression.confidence_change || 0) * 100)}%</div>
        <div className="stat-label" style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Confidence Change</div>
      </div>
      <div className="stat-card" style={{ padding: '20px', background: '#F8FAFC', borderRadius: '20px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
        <div className="stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#7C6FCD' }}>{progression.trend_points?.length || 0}</div>
        <div className="stat-label" style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Data Points</div>
      </div>
    </div>

    {/* Chart Wrapper with Overflow Protection */}
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      overflowX: 'auto', 
      paddingBottom: '24px', // Space for the scrollbar so it doesn't hide dates
      WebkitOverflowScrolling: 'touch' 
    }}>
      <div className="timeline-chart" style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: progression.trend_points?.length > 5 ? 'flex-start' : 'center', 
        gap: '20px', 
        height: '200px', 
        padding: '0 20px',
        minWidth: 'max-content' // Ensures container expands to show all bars
      }}>
        {(progression.trend_points || []).map((point) => (
          <div key={point.sessionId} className="bar-wrap" style={{ 
            flex: '0 0 50px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <div
              className="bar"
              style={{ 
                width: '24px', 
                background: 'linear-gradient(to top, #7C6FCD, #B09EE8)',
                borderRadius: '6px 6px 2px 2px',
                height: `${Math.max(12, Math.round((point.confidence || 0) * 140))}px`,
                transition: 'height 1s ease',
                boxShadow: '0 4px 10px rgba(124, 111, 205, 0.15)'
              }}
            />
            <span className="bar-label" style={{ 
              fontSize: '10px', 
              color: '#94A3B8', 
              fontWeight: 800, 
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}>
              {new Date(point.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
)}

    {/* ── DOCTOR CTA ── */}
    <section style={{ 
      maxWidth: '800px', 
      margin: '0 auto 32px', 
      background: "#9b8edf", 
      borderRadius: '28px', 
      padding: '32px',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      boxShadow: '0 12px 24px rgba(124, 111, 205, 0.2)'
    }}>
      <div style={{ fontSize: '48px' }}>👩‍⚕️</div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Consult a Specialist</h4>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
          Discuss these findings with a <strong>{SPECIALTY_MAP[primary.tendency] || "specialist"}</strong> for clinical guidance.
        </p>
      </div>
      <button 
        onClick={() => navigate("/doctors", { state: { condition: primary.tendency } })}
        style={{ padding: '14px 28px', borderRadius: '14px', background: '#FFFFFF', color: '#7C6FCD', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        Find Doctors →
      </button>
    </section>

    {/* ── FOOTER ACTIONS ── */}
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '40px' }}>
      <button onClick={() => navigate("/checkin")} style={{ padding: '14px 24px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>New Check-in</button>
      <button onClick={() => navigate(`/timeline/${userId}`)} style={{ padding: '14px 24px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>📊 History</button>
      <Link to={`/report/${sessionId}`} style={{ padding: '14px 28px', borderRadius: '14px', background: 'linear-gradient(135deg, #C9A44A, #E8C97A)', color: '#2A1F4E', fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 12px rgba(201, 164, 74, 0.2)' }}>📄 Full Report</Link>
    </div>

    {/* ── DISCLAIMER ── */}
    <div style={{ 
      maxWidth: '800px', margin: '0 auto 60px', padding: '24px', 
      background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '20px',
      fontSize: '13px', color: '#92400E', display: 'flex', gap: '16px', lineHeight: 1.6
    }}>
      <span style={{ fontSize: '20px' }}>⚠️</span>
      <p style={{ margin: 0 }}>
        <strong>Medical Screening Only:</strong> This result is based on algorithm patterns and is <strong>not</strong> a medical diagnosis. Always consult with a licensed doctor before starting any treatment or making health decisions.
      </p>
    </div>
    
    <style>{`
      .capitalize { text-transform: capitalize; }
      .timeline-chart div div { transition: height 1s ease-out; }
    `}</style>
  </div>
);
}
