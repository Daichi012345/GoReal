import React, { createContext, useContext, useEffect, useState } from 'react';
// @ts-ignore
const SecureStore = require('expo-secure-store');

type User = any;

type AuthContextValue = {
  user: User | null;
  token: string | null;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync('authToken');
        const u = await SecureStore.getItemAsync('userData');
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
      } catch (e) {
        console.warn('AuthProvider load failed', e);
      }
    })();
  }, []);

  const signIn = async (t: string, u: User) => {
    try {
      await SecureStore.setItemAsync('authToken', t);
      await SecureStore.setItemAsync('userData', JSON.stringify(u));
    } catch (e) {
      console.warn('SecureStore 保存失敗', e);
    }
    setToken(t);
    setUser(u);
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
    } catch (e) {
      console.warn('SecureStore delete failed', e);
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
