const asyncHandler = require("../utils/asyncHandler");
const { runScreening, getScreeningHistory, getRiskProgression } = require("../services/screeningService");
const { buildSessionReportPdf } = require("../services/reportService");
const { generateConditionDetails } = require("../services/groqService");

const screenUserRisk = asyncHandler(async (req, res) => {
  const session = await runScreening(req.body);
  const conditionDetails = await generateConditionDetails(session);
  res.status(200).json({
    message: "Screening completed",
    sessionId: session._id,
    output: session.output,
    conditionDetails,
  });
});

const getUserScreeningHistory = asyncHandler(async (req, res) => {
  const sessions = await getScreeningHistory(req.params.userId);
  res.status(200).json({ data: sessions });
});

const getUserRiskProgression = asyncHandler(async (req, res) => {
  const progression = await getRiskProgression(req.params.userId);
  res.status(200).json(progression);
});

const downloadSessionReport = asyncHandler(async (req, res) => {
  console.log("Downloading report for session:", req.params.sessionId);
  const { pdfBuffer, session } = await buildSessionReportPdf(req.params.sessionId);
  console.log("PDF generated, size:", pdfBuffer ? pdfBuffer.length : 0);
  
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=screening-report-${session._id}.pdf`);
  res.setHeader("Content-Length", pdfBuffer.length);
  res.status(200).send(pdfBuffer);
});

module.exports = { screenUserRisk, getUserScreeningHistory, getUserRiskProgression, downloadSessionReport };
