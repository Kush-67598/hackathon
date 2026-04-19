const multer = require("multer");
const ApiError = require("../utils/ApiError");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const isPdf = file.mimetype === "application/pdf";
    if (!isPdf) {
      cb(new ApiError(400, "Only PDF files are allowed"));
      return;
    }
    cb(null, true);
  },
});

module.exports = upload;
