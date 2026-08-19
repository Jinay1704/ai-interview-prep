import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("jwt_token"));
  const [isLoaded, setIsLoaded] = useState(false);

  // On mount: if we have a token, fetch /user/me to hydrate user state
  useEffect(() => {
    if (!token) {
      setIsLoaded(true);
      return;
    }
    api.get("/user/me")
      .then((res) => setUser(res.data.data))
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem("jwt_token");
        setToken(null);
      })
      .finally(() => setIsLoaded(true));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem("jwt_token", token);
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (email, password, firstName, lastName) => {
    const res = await api.post("/auth/register", { email, password, firstName, lastName });
    const { token, user } = res.data.data;
    localStorage.setItem("jwt_token", token);
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("jwt_token");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isLoaded,
    isSignedIn: !!user && !!token,
    login,
    register,
    signOut,
    displayName: user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
      : "",
    avatarUrl: user?.imageUrl ?? "",
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};
