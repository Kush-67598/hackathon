const ScreeningSession = require("../models/ScreeningSession");
const { buildClinicalReport } = require("./reportBuilder");
const ApiError = require("../utils/ApiError");

async function buildSessionReportPdf(sessionId) {
  const session = await ScreeningSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Screening session not found");
  }

  try {
    const pdfBuffer = await buildClinicalReport(session);
    return { pdfBuffer, session };
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new ApiError(500, "Failed to generate PDF: " + error.message);
  }
}

module.exports = { buildSessionReportPdf };
