import api from "./api";

export const registerWorker = async (workerData: any) => {
  const response = await api.post("/workers/register", workerData);
  return response.data;
};

export const getMyWorkerProfile = async () => {
  const response = await api.get("/workers/me");
  return response.data;
};

export const updateWorkerProfile = async (data: any) => {
  const response = await api.put("/workers/me", data);
  return response.data;
};