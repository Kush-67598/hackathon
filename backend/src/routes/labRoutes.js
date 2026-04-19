const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { uploadAndExtractLabs } = require("../controllers/labController");

const router = express.Router();

router.post("/lab/upload", upload.single("report"), uploadAndExtractLabs);

module.exports = router;
