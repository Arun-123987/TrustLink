import api from "./api";

export const getWorkerDashboard = async () => {
  const response = await api.get("/workers/dashboard");
  return response.data;
};

export const updateAvailability = async (isAvailable) => {
  const response = await api.put("/workers/availability", {
    isAvailable,
  });

  return response.data;
};