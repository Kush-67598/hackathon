const express = require("express");
const { createSymptomLog, getUserSymptoms, parseChatSymptoms } = require("../controllers/symptomController");

const router = express.Router();

router.post("/symptoms/log", createSymptomLog);
router.post("/symptoms/chat-parse", parseChatSymptoms);
router.get("/symptoms/:userId", getUserSymptoms);

module.exports = router;
