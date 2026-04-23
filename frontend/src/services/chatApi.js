import { useScreeningStore } from "../stores/screeningStore";
import { useProfileStore } from "../stores/profileStore";
import { useSymptomStore } from "../stores/symptomStore";
import apiClient from "./apiClient";

const SYSTEM_PROMPT = `You are CycleSense AI, a compassionate health companion for women. You help users understand their hormonal screening results and provide general wellness guidance.

IMPORTANT RULES:
1. NEVER provide a medical diagnosis. Always clarify that you are NOT a doctor.
2. ALWAYS include: "I'm not a medical professional. Please consult a qualified healthcare provider for medical advice."
3. Be empathetic, warm, and supportive in your tone.
4. Use simple, clear language accessible to non-medical users.
5. If asked about symptoms, provide general wellness context without diagnosing.
6. Always encourage users to follow up with their healthcare provider for proper evaluation.
7. Keep responses concise but informative (2-4 sentences for simple questions, up to 8 sentences for complex ones).

Your responses should feel like a caring friend who happens to know a lot about women's hormonal health.`;

export async function sendChatMessage(userMessage) {
  const latestOutput = useScreeningStore.getState().latestOutput;
  const profile = useProfileStore.getState().profile;
  const symptomState = useSymptomStore.getState();
  const symptoms = [
    ...(symptomState.physical_symptoms || []),
    ...(symptomState.emotional_symptoms || []),
    ...(symptomState.behavioral_indicators || []),
  ];

  const contextParts = [];
  contextParts.push("USER CONTEXT:");
  contextParts.push(`Age range: ${profile.age}`);
  contextParts.push(
    `Cycle regularity: ${profile.cycleRegularity || "not specified"}`,
  );
  contextParts.push(
    `Sleep: ${profile.lifestyle?.sleepHours || 7} hours per night`,
  );
  contextParts.push(
    `Stress level: ${profile.lifestyle?.stressLevel || "not specified"}`,
  );

  if (latestOutput) {
    contextParts.push("\nLATEST SCREENING RESULT:");
    contextParts.push(
      `Primary tendency: ${latestOutput.primary_tendency || "not available"}`,
    );
    contextParts.push(
      `Confidence: ${Math.round((latestOutput.confidence || 0) * 100)}%`,
    );
    contextParts.push(
      `Secondary tendency: ${latestOutput.secondary_tendency || "none"}`,
    );
    contextParts.push(
      `Recommendations: ${(latestOutput.recommendations || latestOutput.actionable_recommendations || []).join("; ")}`,
    );
  }

  if (symptoms && symptoms.length > 0) {
    const activeSymptoms = symptoms
      .filter((s) => s.severity !== "none" && s.severity !== 0)
      .map((s) => `${s.name.replace(/_/g, " ")} (${s.severity})`)
      .join(", ");
    if (activeSymptoms) {
      contextParts.push(`\nCURRENT SYMPTOMS: ${activeSymptoms}`);
    }
  }

  const userContext = contextParts.join("\n");

  try {
    const { data } = await apiClient.post("/chat/message", {
      message: userMessage,
      context: `${SYSTEM_PROMPT}\n\n${userContext}`,
    });
    return data?.reply || "I'm not sure how to respond to that. Could you rephrase your question?";
  } catch (err) {
    console.error("Chat request failed:", err);
    return err?.response?.data?.message || "I'm having trouble connecting to my AI brain right now. Please try again in a moment.";
  }
}
