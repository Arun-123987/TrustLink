import api from "./api";

export const getMyWorkerProfile = async () => {
  const response = await api.get("/workers/me");
  return response.data;
};

export const updateWorkerProfile = async (data) => {
  const response = await api.put("/workers/me", data);
  return response.data;
};