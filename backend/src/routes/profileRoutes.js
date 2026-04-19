const express = require("express");
const { upsertProfile } = require("../controllers/profileController");

const router = express.Router();

router.post("/profile", upsertProfile);

module.exports = router;
