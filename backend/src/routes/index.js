const express = require("express");
const authRoutes = require("./auth.routes");
const profileRoutes = require("./profileRoutes");
const symptomRoutes = require("./symptomRoutes");
const screeningRoutes = require("./screeningRoutes");
const labRoutes = require("./labRoutes");
const chatRoutes = require("./chatRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use(profileRoutes);
router.use(symptomRoutes);
router.use(screeningRoutes);
router.use(labRoutes);
router.use(chatRoutes);

module.exports = router;
