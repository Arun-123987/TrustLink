import api from "./api";

export const getNearbyWorkers = async ({
  latitude,
  longitude,
  radius = 10,
  skill = "",
}) => {
  const response = await api.get("/workers/nearby", {
    params: {
      lat: latitude,
      lng: longitude,
      radius,
      skill,
    },
  });

  return response.data;
};

export const getWorkerById = async (id) => {
  const response = await api.get(`/workers/${id}`);
  return response.data;
};