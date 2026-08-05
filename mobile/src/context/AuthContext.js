import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import * as SecureStore from "expo-secure-store";

import { getCurrentUser } from "@/src/services/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [confirmation, setConfirmation] = useState(null);

  const [user, setUser] = useState({
  id: "",
  phone: "",
  role: "",
  displayName: "",
});

useEffect(() => {
  restoreSession();
}, []);

const restoreSession = async () => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    setAccessToken(token);

    const data = await getCurrentUser();

    setUser(data.user);
  } catch (error) {
    console.log(error);

    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  } finally {
    setLoading(false);
  }
};

  const [accessToken, setAccessToken] = useState(null);

  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const value = {
    confirmation,
    setConfirmation,

    user,
    setUser,

    accessToken,
    setAccessToken,

    refreshToken,
    setRefreshToken,

    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};