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
      const response = await api.get("/auth/me");
      setUser(response.data.data);
      setLoading(false);
    };

    loadUser();
  }, []);

  return (
    <AuthContext value={{ user, login, logout, loading }}>
      {children}
    </AuthContext>
  );
};
