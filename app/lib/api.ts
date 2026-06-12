import Constants from "expo-constants";
// @ts-ignore
const SecureStore = require("expo-secure-store");

const FALLBACK_HOSTS = [
  "http://10.200.5.41:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://10.0.2.2:3000",
  "http://10.0.3.2:3000",
];

export const getApiBase = (): string | null => {
  return (
    // Expo config (app.config.js -> extra)
    (Constants.expoConfig &&
      (Constants.expoConfig as any).extra &&
      (Constants.expoConfig as any).extra.API_BASE) ||
    // legacy manifest
    (Constants.manifest &&
      (Constants.manifest as any).extra &&
      (Constants.manifest as any).extra.API_BASE) ||
    null
  );
};

export const resolveApiBase = (): string => {
  return getApiBase() || FALLBACK_HOSTS[0];
};

export const tryFetch = async (
  path: string,
  options?: RequestInit,
): Promise<Response> => {
  const apiBase = getApiBase();
  const hosts = [apiBase, ...FALLBACK_HOSTS].filter(Boolean) as string[];
  let lastErr: unknown = null;
  for (const host of hosts) {
    const url = `${host}${path}`;
    console.log("tryFetch ->", url);
    try {
      // attach Authorization header if token exists
      const token = await SecureStore.getItemAsync("authToken");
      const headers = {
        ...(options && options.headers
          ? (options.headers as Record<string, string>)
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(url, { ...(options || {}), headers });
      return res;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
};

export default tryFetch;
