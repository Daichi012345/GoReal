// @ts-ignore
const SecureStore = require("expo-secure-store");

export const getApiBase = (): string | null => {
  return process.env.EXPO_PUBLIC_API_BASE || null;
};

export const resolveApiBase = (): string => {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API_BASE is not set');
  return apiBase;
};

export const tryFetch = async (path: string, options?: RequestInit): Promise<Response> => {
  const apiBase = resolveApiBase();
  const url = `${apiBase}${path}`;
  console.log('tryFetch ->', url);
  
  // attach Authorization header if token exists
  const token = await SecureStore.getItemAsync('authToken');
  const headers = {
    ...(options && options.headers ? (options.headers as Record<string,string>) : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...(options || {}), headers });
};

export default tryFetch;
