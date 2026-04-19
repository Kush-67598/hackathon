import apiClient from "./apiClient";

export async function saveProfile(payload) {
  const { data } = await apiClient.post("/profile", payload);
  return data;
}
