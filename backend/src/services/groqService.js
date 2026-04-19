require("dotenv").config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are a clinical AI assistant providing structured medical information for a hormonal screening report.
Respond ONLY with valid JSON in the exact format specified. No other text.
Your response must be a JSON object with the structure shown in the example.`;

async function generateConditionDetails(session) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    return null;
  }

  const { inputSnapshot: input, output } = session;
  const symptoms = input.symptoms || [];
  const labValues = input.labValues || {};

  const symptomSummary = symptoms.map((s) => s.name).join(", ") || "Not specified";
  const labSummary = Object.entries(labValues)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ") || "No lab values";

  const userMessage = `Respond with ONLY JSON. No other text. Format:

{
  "primary": {
    "short": "1-line brief description",
    "description": "2-3 sentence detailed description",
    "symptoms": ["symptom1", "symptom2", "symptom3", "symptom4", "symptom5", "symptom6"],
    "foods": ["food1", "food2", "food3", "food4", "food5"],
    "precautions": ["precaution1", "precaution2", "precaution3", "precaution4"]
  },
  "secondary": {
    "short": "1-line brief description",
    "description": "2-3 sentence detailed description", 
    "symptoms": ["symptom1", "symptom2", "symptom3", "symptom4", "symptom5", "symptom6"],
    "foods": ["food1", "food2", "food3", "food4", "food5"],
    "precautions": ["precaution1", "precaution2", "precaution3", "precaution4"]
  }
}

Condition: ${output.primary_tendency}
Confidence: ${(output.confidence * 100).toFixed(0)}%
Secondary: ${output.secondary_tendency || "none"}
Secondary Confidence: ${(output.secondary_confidence * 100).toFixed(0)}%

Symptoms: ${symptomSummary}
Labs: ${labSummary}`;

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
        temperature: 0.2,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API error:", response.status, errorData);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse Groq response:", parseError.message);
      return null;
    }
  } catch (error) {
    console.error("Groq API request failed:", error.message);
    return null;
  }
}

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

module.exports = { generateClinicalInsights, generateConditionDetails };
