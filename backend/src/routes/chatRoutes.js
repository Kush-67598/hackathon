const express = require("express");
const { chatMessage } = require("../controllers/chatController");

const router = express.Router();

router.post("/chat/message", chatMessage);

module.exports = router;
