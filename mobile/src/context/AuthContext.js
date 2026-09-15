import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import * as SecureStore from "expo-secure-store";

import { getCurrentUser } from "@/src/services/authApi";

const AuthContext = createContext();

const EMPTY_USER = {
  id: "",
  phone: "",
  role: "",
  displayName: "",
};

export const AuthProvider = ({ children }) => {
  const [confirmation, setConfirmation] = useState(null);
  const [user, setUser] = useState(EMPTY_USER);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await SecureStore.getItemAsync(
        "accessToken"
      );

      const storedRefreshToken =
        await SecureStore.getItemAsync("refreshToken");

      if (!token && !storedRefreshToken) {
        return;
      }

      if (token) {
        setAccessToken(token);
      }

      if (storedRefreshToken) {
        setRefreshToken(storedRefreshToken);
      }

      const data = await getCurrentUser();

      if (data?.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.log(
        "Session restore failed:",
        error.message
      );

      setUser(EMPTY_USER);
      setAccessToken(null);
      setRefreshToken(null);

      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
    } finally {
      setLoading(false);
    }
  };

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