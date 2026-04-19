const asyncHandler = require("../utils/asyncHandler");
const { extractLabsFromPdf } = require("../services/labExtractionService");

const uploadAndExtractLabs = asyncHandler(async (req, res) => {
  const result = await extractLabsFromPdf(req.file ? req.file.buffer : null);
  res.status(200).json(result);
});

module.exports = { uploadAndExtractLabs };
