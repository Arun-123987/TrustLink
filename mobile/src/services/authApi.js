import api from "./api";

export const backendLogin = async (idToken) => {
  const response = await api.post("/auth/login", {
    idToken,
  });

  return response.data;
};

// ADD THIS
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};