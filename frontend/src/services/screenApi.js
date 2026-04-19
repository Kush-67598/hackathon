import apiClient from "./apiClient";

export async function runScreening(payload) {
  const { data } = await apiClient.post("/screen", payload);
  return data;
}

export async function fetchScreenHistory(userId) {
  const { data } = await apiClient.get(`/screen/history/${userId}`);
  return data;
}

export async function fetchRiskProgression(userId) {
  const { data } = await apiClient.get(`/screen/progression/${userId}`);
  return data;
}

export async function downloadSessionReport(sessionId) {
  const response = await apiClient.get(`/screen/report/${sessionId}`, { responseType: "blob" });
  return response.data;
}
