const asyncHandler = require("../utils/asyncHandler");
const { logSymptoms, getSymptomsByUser, extractSymptomsFromChat } = require("../services/symptomService");

const createSymptomLog = asyncHandler(async (req, res) => {
  const log = await logSymptoms(req.body);
  res.status(201).json({ message: "Symptom log saved", data: log });
});

const getUserSymptoms = asyncHandler(async (req, res) => {
  const logs = await getSymptomsByUser(req.params.userId);
  res.status(200).json({ data: logs });
});

const parseChatSymptoms = asyncHandler(async (req, res) => {
  const parsed = extractSymptomsFromChat(req.body.text);
  res.status(200).json(parsed);
});

module.exports = { createSymptomLog, getUserSymptoms, parseChatSymptoms };
