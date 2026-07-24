import api from "./api";

export const registerWorker = async (workerData) => {
  const response = await api.post("/workers/register", workerData);
  return response.data;
};