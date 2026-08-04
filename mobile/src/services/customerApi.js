import api from "./api";

export const getNearbyWorkers = async () => {
  const response = await api.get("/workers/nearby");
  return response.data;
};

export const getWorkerById = async (id) => {
  const response = await api.get(`/workers/${id}`);
  return response.data;
};