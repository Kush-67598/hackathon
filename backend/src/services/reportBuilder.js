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
  ensureSpace(doc, 28);
  doc.x = PAGE_MARGIN;
  doc.fontSize(14).fillColor("#1e3a5f").text(`${number}. ${title}`, PAGE_MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    align: "left",
  });
  doc.moveDown(0.5);
}

function drawSubsection(doc, title) {
  ensureSpace(doc, 22);
  doc.x = PAGE_MARGIN;
  doc.fontSize(11).fillColor("#374151").text(title, PAGE_MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    align: "left",
  });
  doc.moveDown(0.3);
}

function drawBulletPoint(doc, text, indent = 0) {
  ensureSpace(doc, 40);
  doc.x = PAGE_MARGIN;
  doc.fontSize(10).fillColor("#374151").text(`${"  ".repeat(indent)}• ${text}`, PAGE_MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    align: "justify",
  });
  doc.moveDown(0.25);
}

const LAB_PANELS = [
  { title: "HEMATOLOGY & IRON PROFILE", keys: ["hemoglobin", "ferritin"] },
  { title: "THYROID PROFILE", keys: ["tsh", "t3", "t4"] },
  { title: "REPRODUCTIVE HORMONES", keys: ["lh", "fsh"] },
];

function toDisplayValue(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "N/A";
  return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.00$/, "");
}

function getFlagLabel(status) {
  if (status === "high") return "H ▲";
  if (status === "low") return "L ▼";
  return "—";
}

function getActionForLab(key, status) {
  if (status === "normal") return "Within expected range";
  const actionMap = {
    hemoglobin: "Assess anemia causes and iron status",
    ferritin: "Review iron stores and supplementation",
    tsh: "Review thyroid function with clinician",
    t3: "Correlate with thyroid symptoms and repeat if needed",
    t4: "Correlate with thyroid symptoms and repeat if needed",
    lh: "Interpret with menstrual history and cycle day",
    fsh: "Interpret with ovarian reserve context",
  };
  return actionMap[key] || "Clinical correlation advised";
}

function drawTableHeader(doc, headers, x, y, widths) {
  doc.fontSize(9).fillColor("#ffffff");
  doc.rect(x, y, widths.reduce((a, b) => a + b, 0), 20).fill("#0f766e");
  let cursor = x + 6;
  headers.forEach((h, i) => {
    doc.text(h, cursor, y + 6, { width: widths[i] - 8 });
    cursor += widths[i];
  });
}

const PAGE_MARGIN = 50;
const CONTENT_WIDTH = 495;
const FOOTER_HEIGHT = 42;

function getBodyBottom(doc) {
  return doc.page.height - PAGE_MARGIN - FOOTER_HEIGHT;
}

function drawPageHeader(doc) {
  doc.rect(0, 0, doc.page.width, 72).fill("#0f766e");
  doc.fillColor("#ffffff").fontSize(17).text("NIRAMAYA DIAGNOSTIC SCREENING REPORT", PAGE_MARGIN, 20);
  doc.fontSize(9).fillColor("#ccfbf1").text("Structured lab summary for clinical follow-up", PAGE_MARGIN, 44);
  doc.y = 88;
}

function ensureSpace(doc, required = 100) {
  if (doc.y + required > getBodyBottom(doc)) {
    doc.addPage();
    drawPageHeader(doc);
  }
}

function drawTextRow(doc, leftLabel, leftValue, rightLabel, rightValue, y) {
  doc.fontSize(9).fillColor("#0f766e").text(leftLabel, 58, y);
  doc.fillColor("#111827").text(leftValue, 165, y, { width: 140 });
  doc.fillColor("#0f766e").text(rightLabel, 320, y);
  doc.fillColor("#111827").text(rightValue, 420, y, { width: 120 });
}

function drawFooter(doc, sessionId, reportDate) {
  const footerY = doc.page.height - FOOTER_HEIGHT;
  doc.rect(0, footerY, doc.page.width, FOOTER_HEIGHT).fill("#f1f5f9");
  doc.fillColor("#6b7280").fontSize(8).text(
    "Flag legend: H = High | L = Low | — = Within range. This report supports screening and is not a final diagnosis.",
    PAGE_MARGIN,
    footerY + 8,
    { width: CONTENT_WIDTH, align: "center" }
  );
  doc.text(
    `Report ID: ${String(sessionId).slice(-12).toUpperCase()} | Generated: ${reportDate.toLocaleDateString()}`,
    PAGE_MARGIN,
    footerY + 23,
    { width: CONTENT_WIDTH, align: "center" }
  );
}

function drawSimpleTable(doc, { title, headers, widths, rows, rowHeight = 20, textSize = 9, headerColor = "#0f766e", rowAlt = "#f8fafc", border = "#e5e7eb" }) {
  doc.x = PAGE_MARGIN;

  if (title) {
    ensureSpace(doc, 40);
    doc.x = PAGE_MARGIN;
    doc.fontSize(10).fillColor("#0f766e").text(title);
    doc.moveDown(0.2);
  }

  const drawHeader = () => {
    ensureSpace(doc, rowHeight + 12);
    const y = doc.y;
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, rowHeight).fill(headerColor);
    let x = PAGE_MARGIN + 6;
    doc.fontSize(9).fillColor("#ffffff");
    headers.forEach((h, i) => {
      doc.text(h, x, y + 6, { width: widths[i] - 8 });
      x += widths[i];
    });
    doc.y = y + rowHeight + 4;
  };

  drawHeader();

  rows.forEach((row, idx) => {
    doc.fontSize(textSize);
    const computedHeight = row.reduce((maxHeight, cell, i) => {
      const text = cell && typeof cell === "object" && Object.prototype.hasOwnProperty.call(cell, "text")
        ? String(cell.text ?? "")
        : String(cell ?? "");
      const h = doc.heightOfString(text, { width: widths[i] - 8 });
      return Math.max(maxHeight, h + 8);
    }, rowHeight);

    if (doc.y + computedHeight > getBodyBottom(doc)) {
      doc.addPage();
      drawPageHeader(doc);
      if (title) {
        doc.fontSize(10).fillColor("#0f766e").text(`${title} (cont.)`);
        doc.moveDown(0.2);
      }
      drawHeader();
    }

    const y = doc.y;
    const bg = idx % 2 === 0 ? "#ffffff" : rowAlt;
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, computedHeight).fillAndStroke(bg, border);

    let x = PAGE_MARGIN + 6;
    row.forEach((cell, i) => {
      const text = cell && typeof cell === "object" && Object.prototype.hasOwnProperty.call(cell, "text")
        ? String(cell.text ?? "")
        : String(cell ?? "");
      const color = cell?.color || "#111827";
      doc.fontSize(textSize).fillColor(color).text(text, x, y + 5, { width: widths[i] - 8 });
      x += widths[i];
    });
    doc.y = y + computedHeight;
    doc.x = PAGE_MARGIN;
  });

  doc.moveDown(0.6);
  doc.x = PAGE_MARGIN;
}

async function buildClinicalReport(session) {
  const clinicalInsights = await generateClinicalInsights(session);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks = [];

      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", err => reject(err));

      const input = session.inputSnapshot || {};
      const output = session.output || {};
      const profile = input.profile || {};
      const reportDate = new Date();
      const labValues = input.labValues || {};
      const physicalSymptoms = input.physical_symptoms || [];
      const emotionalSymptoms = input.emotional_symptoms || [];
      const behavioralIndicators = input.behavioral_indicators || [];
      const symptoms = [...physicalSymptoms, ...emotionalSymptoms, ...behavioralIndicators];

      drawPageHeader(doc);

      const infoTop = doc.y;
      doc.rect(PAGE_MARGIN, infoTop, CONTENT_WIDTH, 78).fillAndStroke("#f0fdfa", "#99f6e4");
      drawTextRow(doc, "Session ID", String(session._id).slice(-12).toUpperCase(), "Primary Tendency", output.primary_tendency || "Insufficient data", infoTop + 10);
      drawTextRow(doc, "Report Date", reportDate.toLocaleString(), "Confidence", formatConfidence(output.confidence || 0), infoTop + 30);
      drawTextRow(doc, "Profile Age", profile.age ? `${profile.age} years` : "Not provided", "Secondary Tendency", output.secondary_tendency || "N/A", infoTop + 50);
      doc.y = infoTop + 92;

      drawSectionTitle(doc, "LAB VALUES TABLE", "1");
      doc.fontSize(10).fillColor("#374151").text(
        "This section summarizes the available lab markers, reference ranges, and any abnormal flags that may need clinical follow-up.",
        PAGE_MARGIN,
        doc.y,
        { width: CONTENT_WIDTH, align: "justify" }
      );
      doc.moveDown(0.4);

      const labRows = [];
      const abnormalRows = [];
      Object.entries(LAB_REFERENCE_RANGES).forEach(([key, ref]) => {
        const value = labValues[key];
        if (value === null || value === undefined || value === "") return;
        const status = getLabStatus(value, ref.min, ref.max);
        const flag = getFlagLabel(status.status);
        const tableRow = [
          { text: ref.label },
          { text: toDisplayValue(value) },
          { text: flag, color: status.color },
          { text: `${ref.min} - ${ref.max}` },
          { text: ref.unit },
        ];
        labRows.push(tableRow);
        if (status.status !== "normal") {
          abnormalRows.push({ key, ref, value, status });
        }
      });

      if (labRows.length) {
        drawSimpleTable(doc, {
          title: "AVAILABLE MARKERS",
          headers: ["Test", "Result", "Flag", "Reference", "Unit"],
          widths: [185, 75, 55, 105, 75],
          rows: labRows,
        });
      } else {
        doc.fontSize(10).fillColor("#6b7280").text("No laboratory values were available for this report.");
        doc.moveDown(0.8);
      }

      const uniqueSymptoms = [];
      const seenSymptoms = new Set();
      symptoms.forEach((s) => {
        if (!s?.name || seenSymptoms.has(s.name)) return;
        seenSymptoms.add(s.name);
        uniqueSymptoms.push(s);
      });

      if (uniqueSymptoms.length) {
        drawSectionTitle(doc, "SYMPTOM SUMMARY", "2");
        doc.fontSize(10).fillColor("#374151").text(
          "Symptoms selected during check-in are grouped below to provide context alongside laboratory findings.",
          PAGE_MARGIN,
          doc.y,
          { width: CONTENT_WIDTH, align: "justify" }
        );
        doc.moveDown(0.4);
        const symptomRows = uniqueSymptoms.slice(0, 16).map((s) => [
          { text: formatSymptomName(s.name) },
          { text: s.severity || "N/A" },
          { text: s.durationWeeks ? `${s.durationWeeks} wk` : "N/A" },
          { text: s.frequency || "N/A" },
        ]);

        drawSimpleTable(doc, {
          title: "USER-SELECTED SYMPTOMS",
          headers: ["Symptom", "Severity", "Duration", "Frequency"],
          widths: [230, 90, 80, 95],
          rows: symptomRows,
        });
      }

      drawSectionTitle(doc, "INTERPRETATION", "3");
      doc.fontSize(10).fillColor("#374151").text(
        "Interpretation highlights notable patterns from symptoms and labs. These are screening-level insights and should be clinically correlated.",
        PAGE_MARGIN,
        doc.y,
        { width: CONTENT_WIDTH, align: "justify" }
      );
      doc.moveDown(0.4);
      const primaryDetail = getConditionDetail(output.primary_tendency || "");
      if (primaryDetail?.short) {
        drawBulletPoint(doc, `Primary screening pattern: ${primaryDetail.short}`);
      } else {
        drawBulletPoint(doc, `Primary screening pattern: ${output.primary_tendency || "Insufficient data"}`);
      }

      if (abnormalRows.length) {
        abnormalRows.slice(0, 4).forEach((item) => {
          const dir = item.status.status === "high" ? "high" : "low";
          drawBulletPoint(doc, `${item.ref.label} is ${dir} (${toDisplayValue(item.value)} ${item.ref.unit}); ${getActionForLab(item.key, item.status.status)}.`);
        });
      } else {
        drawBulletPoint(doc, "All available configured markers are within their reference ranges.");
      }

      if (clinicalInsights) {
        String(clinicalInsights)
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 3)
          .forEach((line) => drawBulletPoint(doc, line.replace(/^[-•]\s*/, "")));
      }

      drawSectionTitle(doc, "CRITICAL / ACTIONABLE VALUES", "4");
      doc.fontSize(10).fillColor("#374151").text(
        "Abnormal markers are listed with concise next-step guidance to support discussion with a healthcare professional.",
        PAGE_MARGIN,
        doc.y,
        { width: CONTENT_WIDTH, align: "justify" }
      );
      doc.moveDown(0.4);
      if (abnormalRows.length) {
        const actionableRows = abnormalRows.map((item) => [
          { text: item.ref.label },
          { text: `${toDisplayValue(item.value)} ${item.ref.unit}` },
          { text: getFlagLabel(item.status.status), color: item.status.color },
          { text: getActionForLab(item.key, item.status.status), color: "#7c2d12" },
        ]);
        drawSimpleTable(doc, {
          title: "ABNORMAL MARKERS",
          headers: ["Parameter", "Value", "Flag", "Recommended Action"],
          widths: [170, 95, 55, 175],
          rows: actionableRows,
          rowHeight: 22,
          rowAlt: "#fffbeb",
          border: "#fed7aa",
        });
      } else {
        doc.fontSize(10).fillColor("#059669").text("No critical actionable values detected.");
        doc.moveDown(0.8);
      }

      drawSectionTitle(doc, "RECOMMENDATIONS", "5");
      doc.fontSize(10).fillColor("#374151").text(
        "Recommendations are generated from the combined screening context and should be tailored by your clinician.",
        PAGE_MARGIN,
        doc.y,
        { width: CONTENT_WIDTH, align: "justify" }
      );
      doc.moveDown(0.4);
      const recommendations = output.actionable_recommendations || output.recommendations || [];
      if (recommendations.length) {
        recommendations.slice(0, 10).forEach((item) => drawBulletPoint(doc, item));
      } else {
        drawBulletPoint(doc, "Consult your clinician for full interpretation and treatment planning.");
      }

      drawFooter(doc, session._id, reportDate);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { buildClinicalReport };
