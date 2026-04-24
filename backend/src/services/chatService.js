const ApiError = require("../utils/ApiError");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are Niramaya AI, a compassionate health companion.
Never provide a medical diagnosis.
Always include: "I'm not a medical professional. Please consult a qualified healthcare provider for medical advice."
Keep responses concise, clear, supportive, and safe.`;

async function generateChatReply(message, context = "") {
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    throw new ApiError(503, "AI chat is not configured on server. Set GROQ_API_KEY in backend environment.");
  }

  const userMessage = String(message || "").trim();
  if (!userMessage) {
    throw new ApiError(400, "Message is required");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: String(context || "") },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(502, `Groq request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I'm not sure how to respond to that right now.";
}

module.exports = { generateChatReply };
