import apiClient from "./apiClient";

export async function createSymptomLog(payload) {
  const { data } = await apiClient.post("/symptoms/log", payload);
  return data;
}

export async function fetchSymptoms(userId) {
  const { data } = await apiClient.get(`/symptoms/${userId}`);
  return data;
}

export async function parseChatSymptoms(text) {
  const { data } = await apiClient.post("/symptoms/chat-parse", { text });
  return data;
}
