import { useState, useEffect } from "react";
import api from "../lib/axios";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (data) => {
    const response = await api.post("/auth/login", data);
    setUser(response.data.data);
    return response.data.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.data);
      } catch (error) {
        // User not authenticated, that's fine
        console.log("User not authenticated", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
