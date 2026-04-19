const ScreeningSession = require("../models/ScreeningSession");
const SymptomLog = require("../models/SymptomLog");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const CONDITION_LABELS = {
  anemia: "Iron-deficiency anemia tendency",
  hypothyroidism: "Hypothyroidism tendency",
  pcos: "PCOS/PCOD tendency",
  hyperthyroidism: "Hyperthyroidism tendency",
  lifestyle_fatigue: "Lifestyle-related fatigue",
};

const PRIMARY_CONDITIONS = ["anemia", "hypothyroidism", "pcos", "hyperthyroidism", "lifestyle_fatigue"];

const SEVERITY_SCORES = {
  none: 0,
  rarely: 1,
  mild: 1,
  sometimes: 2,
  moderate: 2,
  often: 3,
  severe: 4,
  always: 5,
  very_regular: 0,
  slightly_irregular: 2,
  highly_irregular: 4,
  irregular: 3,
  amenorrhea: 5,
  stable: 0,
  slight_gain: 2,
  moderate_gain: 3,
  significant_gain: 4,
  weight_loss: 2,
};

function getConditionSignature(condition, symptoms, labs) {
  const KNOWN_SYMPTOMS = ["fatigue", "hair_fall", "weakness", "weight_gain", "weight_loss", "irregular_cycles", "acne", "heat_intolerance", "cold_intolerance", "palpitations", "increased_appetite", "excessive_sweating", "tremor", "mood_fluctuations", "anxiety", "pelvic_pain", "heavy_bleeding", "no_period", "pelvic_pressure", "cravings", "brain_fog", "muscle_cramps", "skin_issues", "frequent_infections", "hot_flashes"];
  
  const scores = {
    fatigue: 0,
    hair_fall: 0,
    weakness: 0,
    weight_gain: 0,
    weight_loss: 0,
    irregular_cycles: 0,
    acne: 0,
    heat_intolerance: 0,
    cold_intolerance: 0,
    palpitations: 0,
    increased_appetite: 0,
    excessive_sweating: 0,
    tremor: 0,
    anxiety: 0,
    mood_changes: 0,
    low_motivation: 0,
  };
  
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    return { scores, labs: { hb: null, ferritin: null, tsh: null, t3: null, t4: null, lh: null, fsh: null, amh: null } };
  }
  
  for (const s of symptoms) {
    const name = String(s?.name || "").trim().toLowerCase();
    if (!name) continue;
    
    const severityRaw = s?.severity;
    let severity = 2;
    if (typeof severityRaw === "number") {
      severity = Math.max(0, Math.min(5, severityRaw));
    } else if (typeof severityRaw === "string") {
      severity = SEVERITY_SCORES[severityRaw.toLowerCase().trim()] || 2;
    } else {
      severity = 2;
    }
    
    const freq = (s?.frequency === "daily") ? 1 : (s?.frequency === "weekly") ? 0.65 : 0.35;
    const durationBoost = ((s?.durationWeeks || 0) > 4) ? 1.1 : 1;
    const signal = (severity / 5) * freq * durationBoost;
    
    if (KNOWN_SYMPTOMS.includes(name)) {
      scores[name] = (scores[name] || 0) + signal;
    }
  }
  
  const hb = Number(labs?.hemoglobin) || null;
  const ferritin = Number(labs?.ferritin) || null;
  const tsh = Number(labs?.tsh) || null;
  const t3 = Number(labs?.t3) || null;
  const t4 = Number(labs?.t4) || null;
  const lh = Number(labs?.lh) || null;
  const fsh = Number(labs?.fsh) || null;
  const amh = Number(labs?.amh) || null;
  
  return { scores, labs: { hb, ferritin, tsh, t3, t4, lh, fsh, amh } };
}

function evaluateAnemia(sig, labs) {
  let score = 0;
  let contributors = [];
  
  if (sig.fatigue > 0.3) {
    score += sig.fatigue * 0.35;
    contributors.push("fatigue");
  }
  if (sig.weakness > 0.2) {
    score += sig.weakness * 0.25;
    contributors.push("weakness");
  }
  if (sig.hair_fall > 0.2) {
    score += sig.hair_fall * 0.15;
    contributors.push("hair_fall");
  }
  
  if (labs.hb !== null) {
    if (labs.hb < 12) {
      score += 0.4;
      contributors.push("low_hemoglobin");
    } else if (labs.hb < 13.5) {
      score += 0.15;
      contributors.push("borderline_hemoglobin");
    }
  }
  if (labs.ferritin !== null) {
    if (labs.ferritin < 30) {
      score += 0.35;
      contributors.push("low_ferritin");
    } else if (labs.ferritin < 50) {
      score += 0.15;
      contributors.push("borderline_ferritin");
    }
  }
  
  return { score: Math.min(1, score), contributors };
}

function evaluateHypothyroidism(sig, labs) {
  let score = 0;
  let contributors = [];
  
  if (sig.fatigue > 0.3) {
    score += sig.fatigue * 0.3;
    contributors.push("fatigue");
  }
  if (sig.weight_gain > 0.2) {
    score += sig.weight_gain * 0.25;
    contributors.push("weight_gain");
  }
  if (sig.cold_intolerance > 0) {
    score += sig.cold_intolerance * 0.15;
    contributors.push("cold_intolerance");
  }
  if (sig.hair_fall > 0.2) {
    score += sig.hair_fall * 0.15;
    contributors.push("hair_fall");
  }
  if (sig.low_motivation > 0) {
    score += sig.low_motivation * 0.1;
    contributors.push("low_motivation");
  }
  
  if (labs.tsh !== null) {
    if (labs.tsh > 4.5) {
      score += 0.45;
      contributors.push("high_tsh");
    } else if (labs.tsh > 3.5) {
      score += 0.2;
      contributors.push("borderline_tsh");
    }
  }
  if (labs.t4 !== null && labs.t4 < 5) {
    score += 0.25;
    contributors.push("low_t4");
  }
  
  return { score: Math.min(1, score), contributors };
}

function evaluateHyperthyroidism(sig, labs) {
  let score = 0;
  let contributors = [];
  
  if (sig.fatigue > 0.3) {
    score += sig.fatigue * 0.2;
    contributors.push("fatigue");
  }
  if (sig.weight_loss > 0.2) {
    score += sig.weight_loss * 0.35;
    contributors.push("weight_loss");
  }
  if (sig.heat_intolerance > 0) {
    score += sig.heat_intolerance * 0.25;
    contributors.push("heat_intolerance");
  }
  if (sig.palpitations > 0) {
    score += sig.palpitations * 0.2;
    contributors.push("palpitations");
  }
  if (sig.excessive_sweating > 0) {
    score += sig.excessive_sweating * 0.15;
    contributors.push("excessive_sweating");
  }
  if (sig.tremor > 0) {
    score += sig.tremor * 0.15;
    contributors.push("tremor");
  }
  if (sig.anxiety > 0) {
    score += sig.anxiety * 0.1;
    contributors.push("anxiety");
  }
  
  if (labs.tsh !== null) {
    if (labs.tsh < 0.4) {
      score += 0.4;
      contributors.push("low_tsh");
    } else if (labs.tsh < 0.8) {
      score += 0.15;
      contributors.push("borderline_low_tsh");
    }
  }
  if (labs.t4 !== null && labs.t4 > 12) {
    score += 0.2;
    contributors.push("high_t4");
  }
  
  return { score: Math.min(1, score), contributors };
}

function evaluatePCOS(sig, labs) {
  let score = 0;
  let contributors = [];
  
  if (sig.irregular_cycles > 0.3) {
    score += sig.irregular_cycles * 0.35;
    contributors.push("irregular_cycles");
  }
  if (sig.weight_gain > 0.2) {
    score += sig.weight_gain * 0.25;
    contributors.push("weight_gain");
  }
  if (sig.acne > 0.2) {
    score += sig.acne * 0.2;
    contributors.push("acne");
  }
  if (sig.hair_fall > 0.2) {
    score += sig.hair_fall * 0.15;
    contributors.push("hair_fall");
  }
  
  if (labs.lh !== null && labs.fsh !== null && labs.fsh > 0) {
    const ratio = labs.lh / labs.fsh;
    if (ratio >= 2) {
      score += 0.35;
      contributors.push("lh_fsh_ratio");
    }
  }
  if (labs.amh !== null && labs.amh > 4) {
    score += 0.25;
    contributors.push("high_amh");
  }
  if (labs.fsh !== null && labs.fsh < 4) {
    score += 0.15;
    contributors.push("low_fsh");
  }
  
  return { score: Math.min(1, score), contributors };
}

function evaluateLifestyleFatigue(sig, labs, lifestyle, emotionalEffects) {
  let score = 0;
  let contributors = [];
  
  const sleepScore = sig.fatigue > 0.3 ? sig.fatigue * 0.2 : 0;
  const stressScore = ((emotionalEffects?.mood || 0) + (emotionalEffects?.anxiety || 0)) * 0.15;
  const exerciseScore = lifestyle?.exerciseFrequency === "none" ? 0.15 : 0;
  const sleepHrsScore = lifestyle?.sleepHours && lifestyle.sleepHours < 6 ? 0.2 : 0;
  
  const hasNoLabAbnormality = (!labs.hb || labs.hb >= 12) && 
    (!labs.ferritin || labs.ferritin >= 30) && 
    (!labs.tsh || (labs.tsh >= 0.4 && labs.tsh <= 4.5));
  
  const normalLabBonus = hasNoLabAbnormality && sig.fatigue > 0.2 ? 0.15 : 0;
  
  score = sleepScore + stressScore + exerciseScore + sleepHrsScore + normalLabBonus;
  
  let relatedCauses = [];
  if (sleepHrsScore > 0 || sleepScore > 0) {
    relatedCauses.push({ name: "Poor sleep / circadian disruption", match: Math.round((sleepScore + sleepHrsScore) * 100) });
  }
  if (lifestyle?.stressLevel && lifestyle.stressLevel >= 3) {
    relatedCauses.push({ name: "Stress-induced fatigue", match: Math.round(stressScore * 100) });
  }
  if (lifestyle?.exerciseFrequency === "none") {
    relatedCauses.push({ name: "Sedentary lifestyle (deconditioning)", match: Math.round(exerciseScore * 100) });
  }
  if (hasNoLabAbnormality) {
    relatedCauses.push({ name: "General fatigue (no lab abnormalities)", match: Math.round(normalLabBonus * 100) });
  }
  
  const minorRelated = [];
  if (lifestyle?.sleepHours && lifestyle.sleepHours < 6) {
    minorRelated.push({ name: "Mild dehydration (common with poor sleep)", match: 35 });
  }
  if (normalLabBonus > 0 && sig.fatigue > 0.1) {
    minorRelated.push({ name: "Vitamin D deficiency (screening)", match: 40 });
  }
  if (!labs.ferritin || labs.ferritin > 30) {
    minorRelated.push({ name: "Iron deficiency (mild/pre-latent)", match: 30 });
  }
  if (emotionalEffects?.mood > 0 || emotionalEffects?.anxiety > 0) {
    minorRelated.push({ name: "PMS / Premenstrual Syndrome", match: 25 });
    minorRelated.push({ name: "Stress-related fatigue", match: 30 });
  }
  minorRelated.push({ name: "Lifestyle-related weight fluctuation", match: 20 });
  
  return { 
    score: Math.min(0.8, score), 
    contributors: contributors,
    related_causes: relatedCauses,
    minor_related: minorRelated
  };
}

const FREQUENCY_FACTOR = {
  daily: 1,
  weekly: 0.65,
  occasional: 0.35,
};

const SEVERITY_MAP = {
  none: 0,
  rarely: 1,
  mild: 1,
  sometimes: 2,
  moderate: 2,
  often: 3,
  severe: 4,
  always: 5,
  very_regular: 0,
  slightly_irregular: 2,
  highly_irregular: 4,
  irregular: 3,
  amenorrhea: 5,
  stable: 0,
  slight_gain: 2,
  moderate_gain: 3,
  significant_gain: 4,
  weight_loss: 2,
};

const DISCLAIMER = "This is a screening result, not a diagnosis.";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSeverity(value) {
  if (typeof value === "number") {
    return Math.max(0, Math.min(5, value));
  }
  const mapped = SEVERITY_MAP[String(value).toLowerCase().trim()];
  return typeof mapped === "number" ? mapped : 2;
}

function buildSymptomSignal(symptom) {
  const severity = normalizeSeverity(symptom && symptom.severity);
  const severityFactor = Math.min(1, Math.max(0, severity / 5));
  const frequencyFactor = FREQUENCY_FACTOR[symptom && symptom.frequency] || 0.35;
  const worseningBoost = symptom && symptom.worsening ? 1.15 : 1;
  return severityFactor * frequencyFactor * worseningBoost;
}

function getDurationMultiplier(durationWeeks) {
  const weeks = parseFloat(durationWeeks) || 0;
  const growth = Math.log1p(Math.max(0, weeks)) / 2;
  const boundedGrowth = Math.min(0.8, growth);
  return 1 + boundedGrowth;
}

function normalizeSymptomArray(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.filter((item) => item && item.name).map((item) => ({
    name: String(item.name).toLowerCase().trim(),
    severity: item.severity,
    frequency: item.frequency || "weekly",
    durationWeeks: item.durationWeeks,
    worsening: Boolean(item.worsening),
  }));
}

function resolveSymptomBuckets(payload, latestSymptoms) {
  const fallback = normalizeSymptomArray(latestSymptoms);

  const physicalFromNew = normalizeSymptomArray(payload.physical_symptoms);
  const physicalFromLegacy = normalizeSymptomArray(payload.symptoms);
  const physical = physicalFromNew.length
    ? physicalFromNew
    : physicalFromLegacy.length
      ? physicalFromLegacy
      : fallback;

  const emotional = normalizeSymptomArray(payload.emotional_symptoms);
  const behavioral = normalizeSymptomArray(payload.behavioral_indicators);

  return {
    physical,
    emotional,
    behavioral,
  };
}

function computePhysicalScore(physicalSymptoms) {
  const scores = { anemia: 0, hypothyroidism: 0, pcos: 0 };
  const symptomBreakdown = [];

  for (const symptom of physicalSymptoms) {
    const weightEntry = PHYSICAL_WEIGHTS[symptom.name];
    if (!weightEntry) {
      continue;
    }

    const signal = buildSymptomSignal(symptom);
    const durationMultiplier = getDurationMultiplier(symptom.durationWeeks);
    const integratedSignal = signal * durationMultiplier;

    for (const condition of PRIMARY_CONDITIONS) {
      const contribution = (weightEntry[condition] || 0) * integratedSignal;
      scores[condition] += contribution;
      symptomBreakdown.push({
        symptom: symptom.name,
        condition,
        contribution: Number(contribution.toFixed(4)),
      });
    }
  }

  return { scores, symptomBreakdown };
}

function computeCategoryAverage(symptoms, weightMap) {
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    return 0;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const symptom of symptoms) {
    const weight = weightMap[symptom.name] || 0.6;
    const signal = buildSymptomSignal(symptom);
    weightedSum += signal * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return clamp(weightedSum / totalWeight, 0, 1);
}

function computeEmotionalModifier(emotionalSymptoms) {
  return computeCategoryAverage(emotionalSymptoms, EMOTIONAL_WEIGHTS);
}

function computeBehavioralModifier(behavioralIndicators) {
  return computeCategoryAverage(behavioralIndicators, BEHAVIORAL_WEIGHTS);
}

function applySecondaryModifiers(physicalScores, emotionalModifier, behavioralModifier) {
  const emotionalFactor = 1 + (0.3 * emotionalModifier);
  const behavioralFactor = 1 + (0.2 * behavioralModifier);

  const adjusted = {};
  for (const condition of Object.keys(physicalScores)) {
    const base = Number(physicalScores[condition] || 0);
    adjusted[condition] = base > 0
      ? Number((base * emotionalFactor * behavioralFactor).toFixed(4))
      : 0;
  }
  return adjusted;
}

function refineWithLabs(scores, labValues = {}) {
  const adjusted = { ...scores };
  const labImpact = [];
  let supportCount = 0;

  const hb = toNumber(labValues.hemoglobin);
  const ferritin = toNumber(labValues.ferritin);
  const tsh = toNumber(labValues.tsh);
  const t3 = toNumber(labValues.t3);
  const t4 = toNumber(labValues.t4);
  const lh = toNumber(labValues.lh);
  const fsh = toNumber(labValues.fsh);

  if (hb !== null) {
    if (hb < 12) {
      adjusted.anemia += 0.9;
      supportCount += 1;
      labImpact.push({ marker: "hemoglobin", effect: "supports_anemia", value: hb, strength: "high" });
    } else {
      adjusted.anemia -= 0.25;
      labImpact.push({ marker: "hemoglobin", effect: "reduces_anemia_signal", value: hb, strength: "medium" });
    }
  }

  if (ferritin !== null) {
    if (ferritin < 30) {
      adjusted.anemia += 0.6;
      supportCount += 1;
      labImpact.push({ marker: "ferritin", effect: "supports_anemia", value: ferritin, strength: "medium" });
    } else {
      adjusted.anemia -= 0.15;
      labImpact.push({ marker: "ferritin", effect: "reduces_anemia_signal", value: ferritin, strength: "low" });
    }
  }

  if (tsh !== null) {
    if (tsh > 4.5) {
      adjusted.hypothyroidism += 1.0;
      supportCount += 1;
      labImpact.push({ marker: "tsh", effect: "supports_hypothyroidism", value: tsh, strength: "high" });
    } else if (tsh < 0.4) {
      adjusted.hypothyroidism -= 0.4;
      labImpact.push({ marker: "tsh", effect: "weakens_hypothyroidism_signal", value: tsh, strength: "medium" });
    }
  }

  if (t3 !== null && t4 !== null && (t3 < 80 || t4 < 5)) {
    adjusted.hypothyroidism += 0.5;
    supportCount += 1;
    labImpact.push({ marker: "t3_t4", effect: "supports_hypothyroidism", value: { t3, t4 }, strength: "medium" });
  }

  if (lh !== null && fsh !== null && fsh > 0) {
    const ratio = lh / fsh;
    if (ratio >= 2) {
      adjusted.pcos += 0.8;
      supportCount += 1;
      labImpact.push({ marker: "lh_fsh_ratio", effect: "supports_pcos", value: Number(ratio.toFixed(2)), strength: "medium" });
    }
  }

  for (const key of Object.keys(adjusted)) {
    adjusted[key] = Math.max(0, Number(adjusted[key].toFixed(4)));
  }

  return { adjustedScores: adjusted, labImpact, supportCount };
}

function detectConfounders(profile = {}, emotionalModifier = 0, behavioralModifier = 0) {
  const flags = [];

  if (profile.lifestyle) {
    if (Number(profile.lifestyle.stressLevel) >= 4 || emotionalModifier >= 0.7) {
      flags.push("high_stress_may_amplify_fatigue_or_mood_symptoms");
    }
    if (Number(profile.lifestyle.sleepHours) < 6 || behavioralModifier >= 0.7) {
      flags.push("low_sleep_may_confound_fatigue_and_mood");
    }
    if (profile.lifestyle.exerciseFrequency === "none") {
      flags.push("low_activity_can_contribute_to_low_energy");
    }
  }

  if (["vegetarian", "vegan"].includes(profile.dietType)) {
    flags.push("diet_pattern_can_influence_iron_status");
  }

  if (profile.recentEvents) {
    if (profile.recentEvents.pregnancy) {
      flags.push("recent_pregnancy_can_shift_hormonal_and_iron_profiles");
    }
    if (profile.recentEvents.medicationChange) {
      flags.push("recent_medication_change_can_alter_symptom_patterns");
    }
    if (profile.recentEvents.weightChange) {
      flags.push("recent_weight_change_can_affect_cycle_and_endocrine_patterns");
    }
  }

  return flags;
}

function rankConditions(scores) {
  return Object.entries(scores)
    .map(([condition, score]) => ({ condition, score }))
    .sort((a, b) => b.score - a.score);
}

function symptomSignalByName(symptoms, names) {
  if (!Array.isArray(symptoms)) {
    return 0;
  }
  const allowed = new Set(names);
  let maxSignal = 0;
  for (const symptom of symptoms) {
    if (!allowed.has(symptom.name)) {
      continue;
    }
    maxSignal = Math.max(maxSignal, buildSymptomSignal(symptom));
  }
  return maxSignal;
}

function createMinorTendency(name, rawConfidence, maxAllowedConfidence, reasoning) {
  const bounded = clamp(rawConfidence, 0, Math.max(0, maxAllowedConfidence - 0.01));
  if (bounded <= 0.4) {
    return null;
  }
  return {
    name,
    confidence: Number(bounded.toFixed(3)),
    reasoning,
  };
}

function detectMinorTendencies(params) {
  const {
    physicalSymptoms,
    emotionalSymptoms,
    behavioralIndicators,
    profile,
    labValues,
    primaryConfidence,
  } = params;

  const hb = toNumber(labValues.hemoglobin);
  const ferritin = toNumber(labValues.ferritin);
  const tsh = toNumber(labValues.tsh);
  const t3 = toNumber(labValues.t3);
  const t4 = toNumber(labValues.t4);
  const vitD = toNumber(labValues.vitamin_d);
  const b12 = toNumber(labValues.b12);
  const sleepHours = toNumber(profile && profile.lifestyle && profile.lifestyle.sleepHours);
  const stressLevel = toNumber(profile && profile.lifestyle && profile.lifestyle.stressLevel);
  const noExercise = profile && profile.lifestyle && profile.lifestyle.exerciseFrequency === "none";
  const dietType = profile && profile.dietType;

  const fatigueSignal = symptomSignalByName(physicalSymptoms, ["fatigue"]);
  const weaknessSignal = symptomSignalByName(physicalSymptoms, ["weakness"]);
  const hairFallSignal = symptomSignalByName(physicalSymptoms, ["hair_fall"]);
  const cycleSignal = symptomSignalByName(physicalSymptoms, ["irregular_cycles"]);
  const weightSignal = symptomSignalByName(physicalSymptoms, ["weight_gain"]);

  const moodSignal = symptomSignalByName(emotionalSymptoms, ["mood_fluctuations", "irritability", "anxiety"]);
  const anxietySignal = symptomSignalByName(emotionalSymptoms, ["anxiety"]);
  const lowMotivationSignal = symptomSignalByName(emotionalSymptoms, ["low_motivation"]);

  const sleepSignal = symptomSignalByName(behavioralIndicators, ["poor_sleep", "insomnia"]);
  const sunlightSignal = symptomSignalByName(behavioralIndicators, ["low_sunlight_exposure"]);
  const sedentarySignal = symptomSignalByName(behavioralIndicators, ["sedentary_lifestyle"]);
  const caffeineSignal = symptomSignalByName(behavioralIndicators, ["high_caffeine_use"]);
  const irregularMealsSignal = symptomSignalByName(behavioralIndicators, ["irregular_meals"]);

  const maxAllowed = clamp(primaryConfidence, 0.2, 0.95);
  const candidates = [];
  const S = (w1, w2, w3, w4 = 0) =>
    clamp(Number((w1 + w2 + w3 + w4).toFixed(3)), 0, 1);

  candidates.push(createMinorTendency(
    "Vitamin D deficiency",
    S(fatigueSignal * 0.35, weaknessSignal * 0.3, sunlightSignal * 0.2, vitD !== null && vitD < 30 ? 0.15 : 0),
    maxAllowed,
    "Low sunlight exposure, weakness and fatigue pattern suggests possible vitamin D deficiency."
  ));

  candidates.push(createMinorTendency(
    "B12 deficiency",
    S(fatigueSignal * 0.35, weaknessSignal * 0.3, hairFallSignal * 0.15, b12 !== null && b12 < 200 ? 0.25 : 0),
    maxAllowed,
    "Fatigue with hair fall and low B12 levels may indicate nutritional B12 deficiency."
  ));

  candidates.push(createMinorTendency(
    "Mild iron deficiency ( latent anemia)",
    S(fatigueSignal * 0.3, weaknessSignal * 0.25, hairFallSignal * 0.15, (ferritin !== null && ferritin < 30) ? 0.3 : 0),
    maxAllowed,
    "Ferritin below 30 with fatigue/weakness suggests early-stage iron depletion."
  ));

  candidates.push(createMinorTendency(
    "Subclinical hypothyroidism",
    S(fatigueSignal * 0.3, weightSignal * 0.25, (tsh !== null && tsh > 3) ? 0.35 : 0, (t3 !== null && t3 < 100) ? 0.15 : 0),
    maxAllowed,
    "TSH mildly elevated with fatigue may indicate subclinical thyroid underactivity."
  ));

  candidates.push(createMinorTendency(
    "PMS / PMDD",
    S(moodSignal * 0.45, cycleSignal * 0.35, symptomSignalByName(emotionalSymptoms, ["irritability"]) * 0.2, 0),
    maxAllowed,
    "Mood changes linked to menstrual cycle timing may indicate premenstrual syndrome."
  ));

  candidates.push(createMinorTendency(
    "Stress-related adrenal fatigue",
    S(moodSignal * 0.35, fatigueSignal * 0.3, (stressLevel !== null && stressLevel >= 4 ? 0.2 : 0), sleepSignal * 0.15),
    maxAllowed,
    "High perceived stress with sleep disruption and fatigue suggests adrenal overload pattern."
  ));

  candidates.push(createMinorTendency(
    "Sleep architecture disruption",
    S(sleepSignal * 0.55, fatigueSignal * 0.25, (sleepHours !== null && sleepHours < 6 ? 0.2 : 0), 0),
    maxAllowed,
    "Poor sleep quality with daytime fatigue indicates recoverable sleep debt."
  ));

  candidates.push(createMinorTendency(
    "Sedentary lifestyle deconditioning",
    S(sedentarySignal * 0.5, fatigueSignal * 0.25, weightSignal * 0.15, noExercise ? 0.1 : 0),
    maxAllowed,
    "Low activity patterns combined with weight/fatigue signals suggest deconditioning."
  ));

  candidates.push(createMinorTendency(
    "Caffeine overconsumption",
    S(caffeineSignal * 0.5, sleepSignal * 0.2, anxietySignal * 0.15, moodSignal * 0.1),
    maxAllowed,
    "High caffeine use with sleep/ mood symptoms may indicate caffeine-related disruption."
  ));

  candidates.push(createMinorTendency(
    "Irregular meal timing (metabolic stress)",
    S(irregularMealsSignal * 0.4, weightSignal * 0.25, fatigueSignal * 0.2, moodSignal * 0.15),
    maxAllowed,
    "Irregular eating patterns with weight fluctuation may create metabolic stress."
  ));

  // New conditions
  candidates.push(createMinorTendency(
    "Endometriosis",
    S(cycleSignal * 0.35, symptomSignalByName(physicalSymptoms, ["pelvic_pain"]) * 0.4, moodSignal * 0.15, symptomSignalByName(physicalSymptoms, ["heavy_bleeding"]) * 0.1),
    maxAllowed,
    "Severe pelvic pain with menstrual irregularities may indicate endometriosis."
  ));

  candidates.push(createMinorTendency(
    "Menorrhagia (Heavy bleeding)",
    S(symptomSignalByName(physicalSymptoms, ["heavy_bleeding"]) * 0.45, weaknessSignal * 0.25, fatigueSignal * 0.2, (hb !== null && hb < 12) ? 0.1 : 0),
    maxAllowed,
    "Heavy menstrual bleeding with fatigue suggests menorrhagia."
  ));

  candidates.push(createMinorTendency(
    "Amenorrhea (No periods)",
    S(cycleSignal * 0.4, symptomSignalByName(physicalSymptoms, ["no_period"]) * 0.35, weightSignal * 0.15, moodSignal * 0.1),
    maxAllowed,
    "Absence of periods with weight changes may indicate amenorrhea."
  ));

  candidates.push(createMinorTendency(
    "Uterine Fibroids",
    S(symptomSignalByName(physicalSymptoms, ["heavy_bleeding"]) * 0.35, symptomSignalByName(physicalSymptoms, ["pelvic_pressure"]) * 0.35, cycleSignal * 0.2, fatigueSignal * 0.1),
    maxAllowed,
    "Heavy bleeding with pelvic pressure may indicate uterine fibroids."
  ));

  candidates.push(createMinorTendency(
    "PMDD (Severe PMS)",
    S(moodSignal * 0.5, symptomSignalByName(emotionalSymptoms, ["depression"]) * 0.25, cycleSignal * 0.2, symptomSignalByName(emotionalSymptoms, ["irritability"]) * 0.15),
    maxAllowed,
    "Severe mood symptoms linked to menstrual cycle may indicate PMDD."
  ));

  candidates.push(createMinorTendency(
    "Insulin Resistance",
    S(weightSignal * 0.35, fatigueSignal * 0.25, symptomSignalByName(physicalSymptoms, ["cravings"]) * 0.2, cycleSignal * 0.15),
    maxAllowed,
    "Weight gain with cravings and fatigue may indicate insulin resistance."
  ));

  candidates.push(createMinorTendency(
    "Vitamin B Complex deficiency",
    S(fatigueSignal * 0.35, moodSignal * 0.25, weaknessSignal * 0.2, symptomSignalByName(emotionalSymptoms, ["brain_fog"]) * 0.15),
    maxAllowed,
    "Fatigue with mood changes may indicate B vitamin deficiency."
  ));

  candidates.push(createMinorTendency(
    "Magnesium deficiency",
    S(fatigueSignal * 0.3, symptomSignalByName(physicalSymptoms, ["muscle_cramps"]) * 0.35, sleepSignal * 0.2, anxietySignal * 0.15),
    maxAllowed,
    "Muscle cramps with fatigue and poor sleep may indicate magnesium deficiency."
  ));

  candidates.push(createMinorTendency(
    "Zinc deficiency",
    S(hairFallSignal * 0.35, symptomSignalByName(physicalSymptoms, ["skin_issues"]) * 0.3, weaknessSignal * 0.2, symptomSignalByName(behavioralIndicators, ["frequent_infections"]) * 0.15),
    maxAllowed,
    "Hair loss with skin issues may indicate zinc deficiency."
  ));

  candidates.push(createMinorTendency(
    "Perimenopause",
    S(cycleSignal * 0.3, symptomSignalByName(physicalSymptoms, ["hot_flashes"]) * 0.35, moodSignal * 0.2, sleepSignal * 0.15),
    maxAllowed,
    "Irregular cycles with hot flashes and mood changes may indicate perimenopause."
  ));

  return candidates
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
}

function calibrateConfidence(params) {
  const {
    ranked,
    physicalSymptomCount,
    emotionalSymptomCount,
    behavioralSymptomCount,
    emotionalModifier,
    behavioralModifier,
    labCount,
    supportCount,
    confounderCount,
  } = params;

  const top = ranked[0] ? ranked[0].score : 0;
  const second = ranked[1] ? ranked[1].score : 0;
  const separation = top > 0 ? (top - second) / (top + 1) : 0;

  const physicalCompleteness = clamp(physicalSymptomCount / 5, 0, 1);
  const emotionalCompleteness = clamp(emotionalSymptomCount / 3, 0, 1);
  const behavioralCompleteness = clamp(behavioralSymptomCount / 3, 0, 1);
  const labCompleteness = clamp(labCount / 3, 0, 1);

  const completeness = (physicalCompleteness * 0.55)
    + (labCompleteness * 0.3)
    + (emotionalCompleteness * 0.08)
    + (behavioralCompleteness * 0.07);

  const secondarySignalBonus = clamp((emotionalModifier * 0.03) + (behavioralModifier * 0.04), 0, 0.08);
  const labSupportBonus = clamp(supportCount * 0.04, 0, 0.12);
  const confounderPenalty = clamp(confounderCount * 0.03, 0, 0.18);

  const primaryConfidence = clamp(
    0.32 + separation * 0.38 + completeness * 0.24 + secondarySignalBonus + labSupportBonus - confounderPenalty,
    0.2,
    0.95
  );

  const secondaryConfidence = clamp(primaryConfidence * 0.78, 0.15, 0.8);

  return {
    confidence: Number(primaryConfidence.toFixed(3)),
    secondary_confidence: Number(secondaryConfidence.toFixed(3)),
  };
}

function buildRecommendations(primaryCondition, confounders, minorTendencies) {
  const recommendations = [
    "Track symptoms weekly to improve trend clarity.",
    "Discuss persistent or worsening symptoms with a qualified clinician.",
  ];

  if (primaryCondition === "anemia") {
    recommendations.push("Review iron-rich food intake and consider clinician-guided iron panel follow-up.");
  }
  if (primaryCondition === "hypothyroidism") {
    recommendations.push("Consider repeating thyroid panel (TSH, T3, T4) with medical guidance.");
  }
  if (primaryCondition === "pcos") {
    recommendations.push("Track cycle regularity and consult gynecology/endocrine care for hormonal evaluation.");
  }

  if (confounders.length) {
    recommendations.push("Address confounding factors (stress, sleep, or recent events) while monitoring symptoms.");
  }

  if (minorTendencies.some((item) => item.name === "Vitamin D deficiency")) {
    recommendations.push("Consider checking Vitamin D levels and improving safe sunlight exposure based on clinician advice.");
  }
  if (minorTendencies.some((item) => item.name === "Sleep disruption")) {
    recommendations.push("Prioritize sleep routine consistency for 2-3 weeks and reassess energy patterns.");
  }

  return recommendations;
}

function buildSymptomContributions(symptomBreakdown, topConditions) {
  const allowed = new Set(topConditions);
  return symptomBreakdown
    .filter((item) => allowed.has(item.condition) && item.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 10);
}

function buildExplainableOutput(params) {
  const {
    ranked,
    confidence,
    secondary_confidence,
    symptomBreakdown,
    confounders,
    minorTendencies = [],
    related_causes = [],
    minor_related = [],
  } = params;

  const primary = ranked[0]?.name || "insufficient_data";
  const secondary = ranked[1]?.name || "insufficient_data";
  
  const recommendations = [];
  if (confidence >= 0.6) {
    recommendations.push("Strong screening signal - clinical follow-up recommended");
  } else if (confidence >= 0.4) {
    recommendations.push("Moderate signal - monitoring and additional testing suggested");
  } else {
    recommendations.push("Low signal - continue tracking symptoms over time");
  }
  
  if (primary === "anemia") {
    recommendations.push("Review iron studies (ferritin, TIBC) and CBC with clinician");
  } else if (primary === "hypothyroidism") {
    recommendations.push("Confirm with thyroid panel (TSH, Free T4, Free T3)");
  } else if (primary === "hyperthyroidism") {
    recommendations.push("Urgent endocrine consultation if severe symptoms");
  } else if (primary === "pcos") {
    recommendations.push("Gynecological/endocrinology workup recommended");
  } else if (primary === "lifestyle_fatigue") {
    recommendations.push("Prioritize sleep hygiene, stress management, moderate exercise");
  }
  
  for (const confounder of confounders) {
    recommendations.push(`Note: ${confounder.replace(/_/g, " ")}`);
  }

  return {
    primary_tendency: CONDITION_LABELS[primary] || primary,
    confidence: Number(confidence.toFixed(3)),
    secondary_tendency: CONDITION_LABELS[secondary] || secondary,
    secondary_confidence: Number(secondary_confidence.toFixed(3)),
    minor_tendencies: minorTendencies,
    related_causes: related_causes,
    minor_related_factors: minor_related,
    symptom_contributions: symptomBreakdown.slice(0, 10),
    confounding_flags: confounders,
    lab_impact: [],
    recommendations: recommendations,
    actionable_recommendations: recommendations,
    disclaimer: DISCLAIMER,
  };
}

function runScreeningEngine(params) {
  const {
    physicalSymptoms,
    emotionalSymptoms,
    behavioralIndicators,
    profile,
    labValues,
  } = params;

  const allSymptoms = [...(physicalSymptoms || []), ...(emotionalSymptoms || []), ...(behavioralIndicators || [])];
  const lifestyle = profile?.lifestyle || {};
  
  const emotionalEffects = {
    mood: Math.max(
      symptomSignalByName(emotionalSymptoms, ["mood_fluctuations", "irritability"]),
      symptomSignalByName(physicalSymptoms, ["mood_fluctuations"])
    ),
    anxiety: symptomSignalByName(emotionalSymptoms, ["anxiety"]),
  };
  
  const { scores, labs } = getConditionSignature("all", allSymptoms, labValues || {});
  
  const anemiaResult = evaluateAnemia(scores, labs);
  const hypoResult = evaluateHypothyroidism(scores, labs);
  const hyperResult = evaluateHyperthyroidism(scores, labs);
  const pcosResult = evaluatePCOS(scores, labs);
  const lifestyleResult = evaluateLifestyleFatigue(scores, labs, lifestyle, emotionalEffects);
  
  const conditions = [
    { name: "anemia", score: anemiaResult.score, contributors: anemiaResult.contributors },
    { name: "hypothyroidism", score: hypoResult.score, contributors: hypoResult.contributors },
    { name: "hyperthyroidism", score: hyperResult.score, contributors: hyperResult.contributors },
    { name: "pcos", score: pcosResult.score, contributors: pcosResult.contributors },
    { name: "lifestyle_fatigue", score: lifestyleResult.score, contributors: lifestyleResult.contributors || [] },
  ];
  
  const ranked = conditions.filter(c => c.score > 0.05).sort((a, b) => b.score - a.score);
  
  const primary = ranked[0] || { name: "insufficient_data", score: 0, contributors: [] };
  const secondary = ranked[1] || { name: "insufficient_data", score: 0, contributors: [] };
  
  const confidence = primary.score;
  const secondary_confidence = secondary.score;
  
  const confounders = [];
  if (lifestyle?.stressLevel >= 4) confounders.push("high_stress_detected");
  if (lifestyle?.sleepHours < 6) confounders.push("insufficient_sleep");
  if (lifestyle?.exerciseFrequency === "none") confounders.push("sedentary_lifestyle");
  if (["vegetarian", "vegan"].includes(profile?.dietType)) confounders.push("vegetarian_diet_may_affect_iron");
  
  const relatedCauses = lifestyleResult.related_causes || [];
  const minorRelated = lifestyleResult.minor_related || [];
  
  const allMinor = detectMinorTendencies({
    physicalSymptoms,
    emotionalSymptoms,
    behavioralIndicators,
    profile,
    labValues: labValues || {},
    primaryConfidence: confidence,
  });
  
  const minorTendencies = [
    ...relatedCauses.map(rc => ({ name: rc.name, confidence: rc.match / 100, reasoning: `Contributing factor: ${rc.match}% match` })),
    ...allMinor,
  ].sort((a, b) => b.confidence - a.confidence).slice(0, 10);

  const symptomBreakdown = [];
  for (const c of ranked) {
    for (const contrib of c.contributors || []) {
      symptomBreakdown.push({ symptom: contrib, condition: c.name, contribution: c.score });
    }
  }
  
  return buildExplainableOutput({
    ranked,
    confidence,
    secondary_confidence,
    symptomBreakdown,
    confounders,
    minorTendencies,
    related_causes: relatedCauses,
    minor_related: minorRelated,
  });
}

function mergeProfile(baseProfile, inputProfile) {
  if (!inputProfile || typeof inputProfile !== "object") {
    return baseProfile;
  }

  return {
    ...baseProfile,
    ...inputProfile,
    lifestyle: {
      ...(baseProfile.lifestyle || {}),
      ...((inputProfile && inputProfile.lifestyle) || {}),
    },
    recentEvents: {
      ...(baseProfile.recentEvents || {}),
      ...((inputProfile && inputProfile.recentEvents) || {}),
    },
  };
}

async function runScreening(payload) {
  const userId = payload && payload.userId;
  const inputLabs = (payload && (payload.labValues || payload.labs)) || {};

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const profileDoc = await User.findById(userId);
  if (!profileDoc) {
    throw new ApiError(404, "User not found");
  }

  const latestLog = await SymptomLog.findOne({ userId }).sort({ loggedAt: -1 });
  const latestSymptoms = latestLog ? latestLog.symptoms : [];

  const profile = mergeProfile(profileDoc.toObject(), payload && payload.profile);
  const buckets = resolveSymptomBuckets(payload || {}, latestSymptoms);

  if (!buckets.physical.length) {
    throw new ApiError(404, "No physical symptoms provided and no symptom logs found for user");
  }

  const output = runScreeningEngine({
    physicalSymptoms: buckets.physical,
    emotionalSymptoms: buckets.emotional,
    behavioralIndicators: buckets.behavioral,
    profile,
    labValues: inputLabs,
  });

  const allSymptomsForLegacy = [
    ...buckets.physical,
    ...buckets.emotional,
    ...buckets.behavioral,
  ];

  const session = await ScreeningSession.create({
    userId,
    inputSnapshot: {
      profile,
      symptoms: allSymptomsForLegacy,
      physical_symptoms: buckets.physical,
      emotional_symptoms: buckets.emotional,
      behavioral_indicators: buckets.behavioral,
      labValues: inputLabs,
    },
    output,
    engineVersion: "2.1.0",
  });

  return session;
}

async function getScreeningHistory(userId) {
  const sessions = await ScreeningSession.find({ userId }).sort({ createdAt: -1 });
  return sessions.map((session) => {
    if (!session.inputSnapshot) {
      return session;
    }

    const snapshot = session.inputSnapshot;
    if ((!snapshot.physical_symptoms || snapshot.physical_symptoms.length === 0) && Array.isArray(snapshot.symptoms)) {
      snapshot.physical_symptoms = snapshot.symptoms;
    }

    return session;
  });
}

async function getRiskProgression(userId) {
  const sessions = await ScreeningSession.find({ userId })
    .sort({ createdAt: 1 })
    .select("createdAt output.primary_tendency output.confidence output.secondary_tendency output.secondary_confidence");

  const points = sessions.map((session) => ({
    sessionId: session._id,
    date: session.createdAt,
    primary_tendency: session.output.primary_tendency,
    confidence: session.output.confidence,
    secondary_tendency: session.output.secondary_tendency,
    secondary_confidence: session.output.secondary_confidence,
  }));

  const latest = points[points.length - 1] || null;
  const previous = points.length > 1 ? points[points.length - 2] : null;
  const confidence_change = latest && previous
    ? Number((latest.confidence - previous.confidence).toFixed(3))
    : 0;

  return {
    total_sessions: points.length,
    confidence_change,
    trend_points: points,
  };
}

module.exports = {
  runScreening,
  runScreeningEngine,
  getScreeningHistory,
  getRiskProgression,
};
