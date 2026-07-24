import api from "./api";

export const selectRole = async (role) => {
  const response = await api.put("/users/role", {
    role,
  });

  return response.data;
};