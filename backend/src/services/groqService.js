require("dotenv").config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are a clinical AI assistant providing analysis for a hormonal screening report. 
Your role is to help healthcare professionals understand screening results by:
1. Explaining the likely condition based on symptoms and lab values
2. Identifying key patterns and correlations
3. Suggesting clinical considerations
4. Recommending appropriate follow-up actions

Format your response clearly with:
- A brief condition overview
- Key findings summary
- Clinical considerations
- Follow-up recommendations

Keep explanations clear, professional, and appropriate for clinical context.
Never provide definitive diagnoses - always emphasize these are screening indicators requiring professional evaluation.`;

async function generateClinicalInsights(session) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    console.warn("Groq API key not configured. Using basic report without AI insights.");
    return null;
  }

  const { inputSnapshot: input, output } = session;
  const symptoms = input.symptoms || [];
  const labValues = input.labValues || {};

  const labSummary = Object.entries(labValues)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ") || "No lab values provided";

  const symptomSummary = symptoms
    .map((s) => `${s.name} (severity: ${s.severity || "unknown"}, duration: ${s.durationWeeks || "unknown"} weeks)`)
    .join("; ") || "No symptoms recorded";

  const userMessage = `Please analyze this hormonal screening screening:

PRIMARY FINDING: ${output.primary_tendency} (confidence: ${(output.confidence * 100).toFixed(0)}%)
SECONDARY FINDING: ${output.secondary_tendency} (confidence: ${(output.secondary_confidence * 100).toFixed(0)}%)

SYMPTOMS REPORTED: ${symptomSummary}

LAB VALUES: ${labSummary}

CONTEXTUAL FACTORS: ${output.confounding_flags?.length > 0 ? output.confounding_flags.join(", ") : "None detected"}

TOP CONTRIBUTING FACTORS: ${output.symptom_contributions
    ?.filter((sc) => sc.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5)
    .map((sc) => `${sc.symptom} for ${sc.condition}`)
    .join(", ") || "None identified"}

Provide a concise clinical analysis covering:
1. Brief overview of the primary screening finding
2. Key patterns observed from symptoms and labs
3. Important clinical considerations
4. Suggested follow-up actions`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API error:", response.status, errorData);
      return null;
    }

    const data = await response.json();
    const insights = data.choices?.[0]?.message?.content;
    
    return insights || null;
  } catch (error) {
    console.error("Groq API request failed:", error.message);
    return null;
  }
}

module.exports = { generateClinicalInsights };
