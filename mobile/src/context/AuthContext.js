import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [confirmation, setConfirmation] = useState(null);

  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(null);

  const [refreshToken, setRefreshToken] = useState(null);

  const value = {
    confirmation,
    setConfirmation,

    user,
    setUser,

    accessToken,
    setAccessToken,

    refreshToken,
    setRefreshToken,
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