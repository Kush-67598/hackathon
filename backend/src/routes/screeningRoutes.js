const express = require("express");
const {
  screenUserRisk,
  getUserScreeningHistory,
  getUserRiskProgression,
  downloadSessionReport,
} = require("../controllers/screeningController");

const router = express.Router();

router.post("/screen", screenUserRisk);
router.get("/screen/history/:userId", getUserScreeningHistory);
router.get("/screen/progression/:userId", getUserRiskProgression);
router.get("/screen/report/:sessionId", downloadSessionReport);

module.exports = router;
