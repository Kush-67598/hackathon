const PDFDocument = require("pdfkit");
const { generateClinicalInsights } = require("./groqService");

const LAB_REFERENCE_RANGES = {
  hemoglobin: { min: 12, max: 16, unit: "g/dL", label: "Hemoglobin" },
  ferritin: { min: 30, max: 200, unit: "ng/mL", label: "Ferritin" },
  tsh: { min: 0.4, max: 4.5, unit: "mIU/L", label: "TSH" },
  t3: { min: 80, max: 200, unit: "ng/dL", label: "T3" },
  t4: { min: 5, max: 12, unit: "ug/dL", label: "T4" },
  lh: { min: 2, max: 15, unit: "mIU/mL", label: "LH" },
  fsh: { min: 3, max: 12, unit: "mIU/mL", label: "FSH" },
};

const CONDITION_DETAILS = {
  "Iron-deficiency anemia tendency": {
    short: "Low iron levels reducing oxygen-carrying capacity in blood",
    description: "Iron deficiency anemia occurs when your body doesn't have enough iron to produce hemoglobin, the protein in red blood cells that carries oxygen.",
    symptoms: ["Fatigue", "Weakness", "Pale skin", "Shortness of breath", "Dizziness"],
    foods: ["Red meat", "Leafy greens", "Beans", "Iron-fortified cereals"],
  },
  "Hypothyroidism tendency": {
    short: "Underactive thyroid gland slowing metabolism",
    description: "Hypothyroidism is a condition in which the thyroid gland doesn't produce enough thyroid hormones, slowing metabolism.",
    symptoms: ["Fatigue", "Weight gain", "Cold intolerance", "Dry skin", "Hair loss"],
    foods: ["Iodine-rich foods", "Selenium", "Zinc", "Lean protein"],
  },
  "Hyperthyroidism tendency": {
    short: "Overactive thyroid gland speeding up metabolism",
    description: "Hyperthyroidism is when the thyroid gland produces too much thyroid hormone, speeding up metabolism.",
    symptoms: ["Weight loss", "Rapid heartbeat", "Nervousness", "Heat intolerance", "Tremor"],
    foods: ["Calorie-dense foods", "Calcium", "Vitamin D", "Avoid excess iodine"],
  },
  "PCOS/PCOD tendency": {
    short: "Hormonal imbalance affecting ovarian function",
    description: "Polycystic Ovary Syndrome (PCOS) is a hormonal disorder causing enlarged ovaries with small cysts.",
    symptoms: ["Irregular periods", "Weight gain", "Excess hair", "Acne", "Darkening of skin"],
    foods: ["High-fiber foods", "Lean protein", "Anti-inflammatory foods", "Whole grains"],
  },
  "Lifestyle-related fatigue": {
    short: "Fatigue related to sleep, stress, or lack of exercise",
    description: "Lifestyle-related fatigue is caused by factors like poor sleep quality, chronic stress, or sedentary lifestyle.",
    symptoms: ["Tiredness", "Low energy", "Difficulty concentrating", "Morning fatigue"],
    foods: ["Hydration", "Balanced meals", "Regular eating schedule"],
  },
  "Vitamin D deficiency": {
    short: "Insufficient vitamin D affecting bone health and immunity",
    description: "Vitamin D deficiency is common and affects calcium absorption, bone health, immune function, and mood.",
    symptoms: ["Fatigue", "Bone pain", "Muscle weakness", "Depression", "Hair loss"],
    foods: ["Sunlight exposure", "Fatty fish", "Egg yolks", "Fortified foods"],
  },
  "B12 deficiency": {
    short: "Low B12 affecting nerve function and blood",
    description: "Vitamin B12 is essential for nerve function and red blood cell production.",
    symptoms: ["Fatigue", "Numbness", "Tingling", "Memory issues", "Anemia"],
    foods: ["Meat", "Fish", "Eggs", "Dairy", "B12-fortified foods"],
  },
  "Iron deficiency (mild/pre-latent)": {
    short: "Early stage iron depletion without full anemia",
    description: "This is an early stage of iron deficiency where iron stores are low but hemoglobin is still normal.",
    symptoms: ["Mild fatigue", "Reduced exercise tolerance", "Brittle nails", "Slight hair loss"],
    foods: ["Red meat", "Beans", "Lentils", "Spinach", "Vitamin C helps absorption"],
  },
  "PMDD (Severe PMS)": {
    short: "Severe premenstrual symptoms affecting daily life",
    description: "Premenstrual Dysphoric Disorder (PMDD) is a severe form of PMS causing significant emotional and physical symptoms.",
    symptoms: ["Severe mood swings", "Depression", "Anxiety", "Irritability", "Fatigue", "Bloating"],
    foods: ["Complex carbs", "Magnesium", "Vitamin B6", "Avoid caffeine", "Limit sugar"],
  },
  "Stress-related fatigue": {
    short: "Chronic stress depleting mental and physical energy",
    description: "Prolonged stress floods the body with cortisol, depleting energy reserves and causing chronic tiredness.",
    symptoms: ["Chronic tiredness", "Sleep issues", "Irritability", "Difficulty concentrating", "Muscle tension"],
    foods: ["Adaptogenic foods", "Magnesium", "B-complex vitamins", "Herbal teas"],
  },
  "Sleep architecture disruption": {
    short: "Poor sleep quality affecting daytime function",
    description: "Sleep disruption means your sleep cycles are broken, reducing restorative sleep.",
    symptoms: ["Unrefreshing sleep", "Daytime drowsiness", "Memory issues", "Mood changes"],
    foods: ["Avoid caffeine after 2pm", "Limit alcohol", "Light dinner", "Tryptophan-rich foods"],
  },
  "Mild dehydration": {
    short: "Insufficient fluid affecting all body functions",
    description: "Even mild dehydration can affect energy, mood, cognitive function, and physical performance.",
    symptoms: ["Fatigue", "Headache", "Dry skin", "Dizziness", "Dark urine"],
    foods: ["Water-rich foods", "Electrolyte drinks", "Cucumber", "Watermelon"],
  },
  "Endometriosis": {
    short: "Uterine tissue growth outside uterus causing pain",
    description: "Endometriosis occurs when tissue similar to the uterine lining grows outside the uterus.",
    symptoms: ["Severe menstrual pain", "Heavy bleeding", "Chronic pelvic pain", "Fatigue"],
    foods: ["Omega-3 rich foods", "Fiber", "Lean protein", "Anti-inflammatory foods"],
  },
  "Menorrhagia (Heavy bleeding)": {
    short: "Excessively heavy or prolonged menstrual bleeding",
    description: "Menorrhagia is characterized by abnormally heavy or prolonged menstrual bleeding.",
    symptoms: ["Heavy flow", "Passing large clots", "Fatigue", "Iron deficiency", "Cramping"],
    foods: ["Iron-rich foods", "Vitamin C", "Vitamin K", "Leafy greens", "Lean protein"],
  },
  "Amenorrhea (No periods)": {
    short: "Absence of menstrual periods",
    description: "Amenorrhea is the absence of menstrual periods caused by various factors.",
    symptoms: ["No periods", "Weight changes", "Hair growth", "Acne", "Mood changes"],
    foods: ["Balanced nutrition", "Healthy fats", "Iron-rich foods", "Avoid extreme dieting"],
  },
  "Uterine Fibroids": {
    short: "Non-cancerous uterine growths causing symptoms",
    description: "Uterine fibroids are non-cancerous growths in the uterus causing various symptoms.",
    symptoms: ["Heavy bleeding", "Pelvic pressure", "Frequent urination", "Back pain"],
    foods: ["Fiber-rich foods", "Green vegetables", "Limit red meat", "Avoid processed foods"],
  },
  "Insulin Resistance": {
    short: "Cells not responding properly to insulin",
    description: "Insulin resistance occurs when cells become less responsive to insulin.",
    symptoms: ["Weight gain", "Fatigue", "Cravings", "Brain fog", "Dark skin patches"],
    foods: ["High-fiber foods", "Lean protein", "Whole grains", "Avoid refined carbs"],
  },
  "Vitamin B Complex deficiency": {
    short: "Low B vitamins affecting energy and mood",
    description: "B vitamin deficiency can cause fatigue, mood changes, and nerve problems.",
    symptoms: ["Fatigue", "Mood changes", "Nerve issues", "Memory problems", "Hair loss"],
    foods: ["Whole grains", "Eggs", "Dairy", "Leafy greens", "Legumes", "Meat"],
  },
  "Magnesium deficiency": {
    short: "Low magnesium causing muscle and sleep issues",
    description: "Magnesium is essential for muscle function, nerve transmission, and sleep.",
    symptoms: ["Muscle cramps", "Fatigue", "Anxiety", "Poor sleep", "Headaches"],
    foods: ["Nuts", "Seeds", "Leafy greens", "Dark chocolate", "Avocados", "Bananas"],
  },
  "Zinc deficiency": {
    short: "Low zinc affecting immunity and hormones",
    description: "Zinc is crucial for immune function, hormone production, and wound healing.",
    symptoms: ["Hair loss", "Frequent infections", "Skin problems", "Loss of appetite"],
    foods: ["Oysters", "Red meat", "Poultry", "Beans", "Nuts", "Dairy"],
  },
  "Perimenopause": {
    short: "Hormonal transition period before menopause",
    description: "Perimenopause is the transition period leading to menopause with fluctuating hormone levels.",
    symptoms: ["Irregular periods", "Hot flashes", "Night sweats", "Mood changes", "Sleep issues"],
    foods: ["Phytoestrogen foods", "Calcium", "Vitamin D", "Fiber", "Avoid triggers"],
  },
};

function formatConfidence(value) {
  return `${(value * 100).toFixed(0)}%`;
}

function getLabStatus(value, min, max) {
  const num = parseFloat(value);
  if (isNaN(num)) return { status: "unavailable", label: "N/A", color: "#6b7280" };
  if (num < min) return { status: "low", label: "Low", color: "#dc2626" };
  if (num > max) return { status: "high", label: "High", color: "#dc2626" };
  return { status: "normal", label: "Normal", color: "#059669" };
}

function formatSymptomName(name) {
  if (!name) return "Unknown";
  return name.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function getConditionDetail(name) {
  if (!name) return null;
  const key = String(name).toLowerCase().trim();
  for (const [descKey, desc] of Object.entries(CONDITION_DETAILS)) {
    if (descKey.toLowerCase().includes(key) || key.includes(descKey.toLowerCase().split(" ")[0])) {
      return desc;
    }
  }
  return CONDITION_DETAILS[name] || null;
}

function drawSectionTitle(doc, title, number) {
  doc.fontSize(14).fillColor("#1e3a5f").text(`${number}. ${title}`);
  doc.moveDown(0.5);
}

function drawSubsection(doc, title) {
  doc.fontSize(11).fillColor("#374151").text(title);
  doc.moveDown(0.3);
}

function drawBulletPoint(doc, text, indent = 0) {
  doc.fontSize(10).fillColor("#374151").text(`${"  ".repeat(indent)}• ${text}`);
  doc.moveDown(0.25);
}

async function buildClinicalReport(session) {
  const clinicalInsights = await generateClinicalInsights(session);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
      const chunks = [];

      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", err => reject(err));

      const input = session.inputSnapshot || {};
      const output = session.output || {};
      const physicalSymptoms = input.physical_symptoms || input.symptoms || [];
      const emotionalSymptoms = input.emotional_symptoms || [];
      const behavioralIndicators = input.behavioral_indicators || [];
      const symptoms = [...physicalSymptoms, ...emotionalSymptoms, ...behavioralIndicators];
      const labValues = input.labValues || {};

      // Header
      doc.rect(0, 0, doc.page.width, 90).fill("#1e3a5f");
      doc.fillColor("#ffffff").fontSize(24).text("Hormonal Health Screening Report", 50, 25);
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 50, 58);
      doc.fontSize(9).fillColor("#cbd5e1").text(`Report ID: ${session._id.toString().slice(-8).toUpperCase()}`, 50, 72);

      doc.moveDown(3);
      doc.fillColor("#111827");

      // Section 1: Conditions Summary Table
      drawSectionTitle(doc, "CONDITIONS IDENTIFIED", "1");

      const primaryCondition = output.primary_tendency || "Unknown";
      const primaryConfidence = output.confidence || 0;
      const secondaryCondition = output.secondary_tendency || "Insufficient Data";
      const secondaryConfidence = output.secondary_confidence || 0;

      const primaryDetail = getConditionDetail(primaryCondition);
      const secondaryDetail = secondaryCondition !== "Insufficient Data" ? getConditionDetail(secondaryCondition) : null;

      // Primary Condition Box
      doc.fontSize(12).fillColor("#1e3a5f").text("PRIMARY CONDITION");
      doc.moveDown(0.3);
      
      const primaryColor = primaryConfidence >= 0.65 ? "#059669" : primaryConfidence >= 0.35 ? "#d97706" : "#6b7280";
      doc.fontSize(16).fillColor(primaryColor).text(primaryCondition);
      doc.fontSize(14).fillColor("#111827").text(`Confidence: ${formatConfidence(primaryConfidence)}`);
      doc.moveDown(0.5);

      if (primaryDetail) {
        doc.fontSize(10).fillColor("#374151").text(`Description: ${primaryDetail.short}`);
        doc.moveDown(0.3);
        doc.fontSize(9).fillColor("#6b7280").text(primaryDetail.description.substring(0, 200) + "...");
        doc.moveDown(0.4);
        doc.fontSize(9).fillColor("#1e3a5f").text(`Common Symptoms: ${primaryDetail.symptoms.join(", ")}`);
        doc.moveDown(0.3);
        doc.fontSize(9).fillColor("#059669").text(`Foods to Consider: ${primaryDetail.foods.join(", ")}`);
      }

      doc.moveDown(1);

      // Secondary Condition
      if (secondaryCondition !== "Insufficient Data") {
        doc.fontSize(11).fillColor("#1e3a5f").text("SECONDARY CONDITION");
        doc.moveDown(0.3);
        doc.fontSize(14).fillColor("#6b7280").text(secondaryCondition);
        doc.fontSize(12).fillColor("#111827").text(`Confidence: ${formatConfidence(secondaryConfidence)}`);
        
        if (secondaryDetail) {
          doc.moveDown(0.3);
          doc.fontSize(9).fillColor("#374151").text(`Description: ${secondaryDetail.short}`);
          doc.moveDown(0.3);
          doc.fontSize(9).fillColor("#059669").text(`Foods to Consider: ${secondaryDetail.foods.join(", ")}`);
        }
      }

      // Minor Tendencies Table
      const minorTendencies = output.minor_tendencies || [];
      if (minorTendencies.length > 0) {
        doc.moveDown(1);
        doc.fontSize(11).fillColor("#1e3a5f").text("MINOR RELATED CONDITIONS");
        doc.moveDown(0.4);

        // Table header
        const tableTop = doc.y;
        doc.fontSize(9).fillColor("#ffffff");
        doc.rect(50, tableTop, 450, 20).fill("#1e3a5f");
        doc.text("Condition", 55, tableTop + 6);
        doc.text("Match %", 250, tableTop + 6);
        doc.text("Description", 320, tableTop + 6);

        let rowY = tableTop + 22;
        doc.fontSize(8).fillColor("#111827");
        
        for (let i = 0; i < Math.min(minorTendencies.length, 6); i++) {
          const item = minorTendencies[i];
          const detail = getConditionDetail(item.name);
          
          doc.rect(50, rowY - 4, 450, 18).fillAndStroke("#f9fafb", "#e5e7eb");
          
          doc.fillColor("#111827").text(item.name.substring(0, 35), 55, rowY);
          doc.fillColor("#1e3a5f").text(`${Math.round((item.confidence || 0) * 100)}%`, 250, rowY);
          doc.fillColor("#6b7280").text(detail ? detail.short.substring(0, 40) : "Related factor", 320, rowY);
          
          rowY += 20;
        }
      }

      doc.moveDown(1);

      // Section 2: Symptom Breakdown
      addPageBreakIfNeeded(doc);
      drawSectionTitle(doc, "SYMPTOM BREAKDOWN", "2");

      if (symptoms.length > 0) {
        const uniqueSymptoms = [];
        const seen = new Set();
        for (const s of symptoms) {
          const key = s && s.name ? s.name : "unknown";
          if (!seen.has(key)) {
            seen.add(key);
            uniqueSymptoms.push(s);
          }
        }

        // Table header
        const symTableTop = doc.y;
        doc.fontSize(9).fillColor("#ffffff");
        doc.rect(50, symTableTop, 450, 20).fill("#1e3a5f");
        doc.text("Symptom", 55, symTableTop + 6);
        doc.text("Severity", 180, symTableTop + 6);
        doc.text("Duration", 260, symTableTop + 6);
        doc.text("Frequency", 350, symTableTop + 6);

        let symRowY = symTableTop + 22;
        doc.fontSize(8).fillColor("#111827");

        for (let i = 0; i < Math.min(uniqueSymptoms.slice(0, 10).length, 10); i++) {
          const symptom = uniqueSymptoms[i];
          const name = formatSymptomName(symptom && symptom.name);
          const severity = typeof symptom?.severity === "number" ? `${symptom.severity}/5` : (symptom?.severity || "N/A");
          const duration = symptom?.durationWeeks ? `${symptom.durationWeeks} weeks` : "N/A";
          const frequency = symptom?.frequency || "N/A";

          doc.rect(50, symRowY - 4, 450, 16).fillAndStroke(i % 2 === 0 ? "#ffffff" : "#f9fafb", "#e5e7eb");
          doc.fillColor("#111827").text(name, 55, symRowY);
          doc.fillColor("#374151").text(severity, 180, symRowY);
          doc.fillColor("#374151").text(duration, 260, symRowY);
          doc.fillColor("#374151").text(frequency, 350, symRowY);

          symRowY += 18;
          if (symRowY > doc.page.height - 100) {
            doc.addPage();
            symRowY = 50;
          }
        }
      }

      // Section 3: Contributing Factors
      doc.moveDown(1);
      drawSectionTitle(doc, "CONTRIBUTING FACTORS", "3");

      const symptomContributions = output.symptom_contributions || [];
      if (symptomContributions.length > 0) {
        const topFactors = symptomContributions
          .filter(sc => sc && sc.contribution > 0)
          .sort((a, b) => b.contribution - a.contribution)
          .slice(0, 5);

        for (let i = 0; i < topFactors.length; i++) {
          const factor = topFactors[i];
          const name = formatSymptomName(factor && factor.symptom);
          const condition = factor.condition ? factor.condition.charAt(0).toUpperCase() + factor.condition.slice(1) : "Unknown";
          
          doc.fontSize(10).fillColor("#111827").text(`${i + 1}. ${name} → ${condition}`);
          doc.fontSize(9).fillColor("#1e3a5f").text(`   Impact: ${formatConfidence(factor.contribution)}`);
          doc.moveDown(0.3);
        }
      }

      // Section 4: Laboratory Values
      doc.moveDown(1);
      drawSectionTitle(doc, "LABORATORY VALUES", "4");

      const availableLabs = Object.entries(labValues).filter(([, v]) => v !== null && v !== undefined && v !== "");

      if (availableLabs.length === 0) {
        doc.fontSize(10).fillColor("#6b7280").text("No laboratory values provided for this session.");
        doc.fontSize(9).fillColor("#92400e").text("Consider providing lab results to improve screening accuracy.");
      } else {
        // Lab table header
        const labTableTop = doc.y;
        doc.fontSize(9).fillColor("#ffffff");
        doc.rect(50, labTableTop, 450, 20).fill("#1e3a5f");
        doc.text("Test", 55, labTableTop + 6);
        doc.text("Value", 180, labTableTop + 6);
        doc.text("Reference Range", 260, labTableTop + 6);
        doc.text("Status", 400, labTableTop + 6);

        let labRowY = labTableTop + 22;
        doc.fontSize(9).fillColor("#111827");

        for (const [key, value] of availableLabs) {
          const ref = LAB_REFERENCE_RANGES[key];
          if (!ref) continue;

          const { label, color: statusColor } = getLabStatus(value, ref.min, ref.max);
          const labRef = LAB_REFERENCE_RANGES[key];

          doc.rect(50, labRowY - 4, 450, 16).fillAndStroke("#ffffff", "#e5e7eb");
          doc.fillColor("#111827").text(ref.label, 55, labRowY);
          doc.fillColor("#111827").text(`${value} ${ref.unit}`, 180, labRowY);
          doc.fillColor("#6b7280").text(`${ref.min}-${ref.max}`, 260, labRowY);
          doc.fillColor(statusColor).text(label, 400, labRowY);

          labRowY += 18;
        }
      }

      // Section 5: Contextual Factors
      doc.moveDown(1);
      drawSectionTitle(doc, "CONTEXTUAL FACTORS", "5");

      const confounders = output.confounding_flags || [];
      if (confounders.length > 0) {
        for (const flag of confounders) {
          drawBulletPoint(doc, String(flag).replace(/_/g, " "));
        }
      } else {
        doc.fontSize(10).fillColor("#6b7280").text("No significant contextual factors detected.");
      }

      // Section 6: Recommendations
      doc.moveDown(1);
      drawSectionTitle(doc, "RECOMMENDATIONS", "6");

      const recommendations = output.recommendations || output.actionable_recommendations || [];
      if (recommendations.length > 0) {
        for (let i = 0; i < recommendations.length; i++) {
          drawBulletPoint(doc, recommendations[i]);
        }
      } else {
        doc.fontSize(10).fillColor("#6b7280").text("No specific recommendations at this time.");
      }

      // Section 7: AI Clinical Analysis
      if (clinicalInsights) {
        doc.moveDown(1);
        drawSectionTitle(doc, "CLINICAL ANALYSIS", "7");
        
        const maxWidth = doc.page.width - 100;
        const lines = clinicalInsights.split("\n");
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            doc.moveDown(0.3);
            continue;
          }
          
          if (trimmed.startsWith("#")) {
            doc.fontSize(11).fillColor("#1e3a5f").text(trimmed.replace(/^#+\s*/, ""));
            doc.moveDown(0.3);
          } else if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
            doc.fontSize(10).fillColor("#374151").text(`  ${trimmed}`);
            doc.moveDown(0.25);
          } else {
            const words = trimmed.split(" ");
            let line = "";
            for (const word of words) {
              const testLine = line + (line ? " " : "") + word;
              if (doc.widthOfString(testLine) > maxWidth && line) {
                doc.fontSize(10).fillColor("#374151").text(line);
                line = word;
              } else {
                line = testLine;
              }
            }
            if (line) {
              doc.fontSize(10).fillColor("#374151").text(line);
            }
            doc.moveDown(0.2);
          }
        }
      }

      // Footer
      const footerY = doc.page.height - 60;
      doc.rect(0, footerY, doc.page.width, 60).fill("#f3f4f6");
      doc.fillColor("#6b7280").fontSize(9).text(
        "This report is a screening summary and not a medical diagnosis. Please consult a healthcare professional for proper evaluation.",
        50, footerY + 10, { align: "center", width: doc.page.width - 100 }
      );
      doc.fontSize(8).text(
        `Report ID: ${session._id.toString().slice(-12).toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`,
        50, footerY + 30, { align: "center", width: doc.page.width - 100 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Helper to add page break if needed
function addPageBreakIfNeeded(doc) {
  if (doc.y > doc.page.height - 100) {
    doc.addPage();
  }
}

module.exports = { buildClinicalReport };