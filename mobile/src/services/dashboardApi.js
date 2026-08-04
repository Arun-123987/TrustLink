import api from "./api";

export const getWorkerDashboard = async () => {
  const response = await api.get("/workers/dashboard");
  return response.data;
};