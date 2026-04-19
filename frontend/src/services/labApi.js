import apiClient from "./apiClient";

export async function uploadLabReport(file) {
  const formData = new FormData();
  formData.append("report", file);
  const { data } = await apiClient.post("/lab/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
