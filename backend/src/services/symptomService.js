const SymptomLog = require("../models/SymptomLog");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

async function logSymptoms(payload) {
  const { userId, symptoms, notes, loggedAt } = payload;
  if (!userId) {
    throw new ApiError(400, "userId is required");
  }
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    throw new ApiError(400, "symptoms must be a non-empty array");
  }

  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  return SymptomLog.create({ userId, symptoms, notes, loggedAt });
}

async function getSymptomsByUser(userId) {
  const logs = await SymptomLog.find({ userId }).sort({ loggedAt: 1 });
  return logs;
}

async function getLatestSymptoms(userId) {
  const latest = await SymptomLog.findOne({ userId }).sort({ loggedAt: -1 });
  if (!latest) {
    throw new ApiError(404, "No symptom logs found for user");
  }
  return latest;
}

function extractSymptomsFromChat(text) {
  const normalized = String(text || "").toLowerCase();
  if (!normalized.trim()) {
    throw new ApiError(400, "text is required for chat symptom parsing");
  }

  const symptomRules = [
    { name: "fatigue", keywords: ["fatigue", "tired", "exhausted", "low energy"] },
    { name: "hair_fall", keywords: ["hair fall", "hairloss", "hair loss", "shedding"] },
    { name: "weakness", keywords: ["weak", "weakness", "lightheaded"] },
    { name: "mood_fluctuations", keywords: ["mood", "irritable", "anxious", "sad"] },
    { name: "irregular_cycles", keywords: ["irregular period", "irregular cycle", "missed period", "late period"] },
  ];

  const durationMatch = normalized.match(/(\d+)\s*(week|weeks)/);
  const durationWeeks = durationMatch ? Number(durationMatch[1]) : 4;

  const severityHints = [
    { words: ["mild", "slight"], severity: 2 },
    { words: ["moderate"], severity: 3 },
    { words: ["severe", "very", "extreme"], severity: 4 },
  ];
  let severity = 3;
  for (const hint of severityHints) {
    if (hint.words.some((w) => normalized.includes(w))) {
      severity = hint.severity;
    }
  }

  const frequency = normalized.includes("daily") ? "daily" : normalized.includes("occasionally") ? "occasional" : "weekly";
  const worsening = normalized.includes("worse") || normalized.includes("worsening") || normalized.includes("increasing");

  const extractedSymptoms = symptomRules
    .filter((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)))
    .map((rule) => ({
      name: rule.name,
      severity,
      frequency,
      durationWeeks,
      worsening,
    }));

  return {
    extractedSymptoms,
    meta: {
      inferredSeverity: severity,
      inferredFrequency: frequency,
      inferredDurationWeeks: durationWeeks,
      inferredWorsening: worsening,
    },
  };
}

module.exports = { logSymptoms, getSymptomsByUser, getLatestSymptoms, extractSymptomsFromChat };
