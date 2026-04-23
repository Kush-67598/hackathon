const asyncHandler = require("../utils/asyncHandler");
const { generateChatReply } = require("../services/chatService");

const chatMessage = asyncHandler(async (req, res) => {
  const { message, context } = req.body || {};
  const reply = await generateChatReply(message, context);
  res.status(200).json({ reply });
});

module.exports = { chatMessage };
