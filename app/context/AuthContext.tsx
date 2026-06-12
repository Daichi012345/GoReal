import React, { createContext, useContext, useEffect, useState } from "react";
// @ts-ignore
const SecureStore = require("expo-secure-store");

type User = any;

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isFirstLogin: boolean;
  isAdminSession: boolean;
  signIn: (token: string, user: User, isFirstLogin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isAdminSession, setIsAdminSession] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync("authToken");
        const u = await SecureStore.getItemAsync("userData");
        const adminSession = await SecureStore.getItemAsync("isAdminSession");
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
        setIsAdminSession(adminSession === "true");
      } catch (e) {
        console.warn("AuthProvider load failed", e);
      }
    })();
  }, []);

  const signIn = async (t: string, u: User, isFirst: boolean = false) => {
    const adminState = u?.role?.toString().toLowerCase() === "admin";
    try {
      await SecureStore.setItemAsync("authToken", t);
      await SecureStore.setItemAsync("userData", JSON.stringify(u));
      await SecureStore.setItemAsync(
        "isAdminSession",
        JSON.stringify(adminState),
      );
    } catch (e) {
      console.warn("SecureStore 保存失敗", e);
    }
    setToken(t);
    setUser(u);
    setIsFirstLogin(isFirst);
    setIsAdminSession(adminState);
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("userData");
      await SecureStore.deleteItemAsync("isAdminSession");
    } catch (e) {
      console.warn("SecureStore delete failed", e);
    }
    setToken(null);
    setUser(null);
    setIsFirstLogin(false);
    setIsAdminSession(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isFirstLogin, isAdminSession, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
