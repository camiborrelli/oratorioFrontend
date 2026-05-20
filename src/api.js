import axios from "axios";

// Prefer VITE_API_URL; if missing in production, call same origin (safer for deploys).
// In development, fall back to host:5000 to allow mobile testing.
const BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? typeof window !== "undefined"
      ? window.location.origin
      : `http://${runtimeHost}:5000`
    : `http://${runtimeHost}:5000`);

const api = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers["Content-Type"] = "application/json";

  if (config.skipAuth) {
    return config;
  }

  // support multiple token key names and skip if missing
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("Token") ||
    localStorage.getItem("TokenId");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

// Generic helper: try to GET a list from several endpoint variants and return an array
export async function fetchList(path) {
  // Log more informative errors for debugging (prints error.response if available)
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      try {
        // Prefer the server response payload if present
        console.error("API response error:", err.response || err);
      } catch (e) {
        console.error("API error (could not stringify):", err);
      }
      return Promise.reject(err);
    },
  );
  const tryPaths = [path, `${path}s`, `${path}/all`];
  for (const p of tryPaths) {
    try {
      const res = await api.get(p);
      const d = res?.data;
      if (Array.isArray(d)) return d;
      if (d && typeof d === "object") {
        // common keys
        if (Array.isArray(d.recorridas)) return d.recorridas;
        if (Array.isArray(d.divisiones)) return d.divisiones;
        if (Array.isArray(d.data)) return d.data;
        if (Array.isArray(d.result)) return d.result;
        // first array value
        for (const v of Object.values(d)) {
          if (Array.isArray(v)) return v;
        }
      }
    } catch (e) {
      // try next
    }
  }
  return [];
}

// Generic helper: try to get a count from /path/cantidad or parse list length
export async function fetchCount(path) {
  const tryCountPaths = [`${path}/cantidad`, `${path}/count`];
  for (const p of tryCountPaths) {
    try {
      const res = await api.get(p);
      if (res?.data?.cantidad != null) return Number(res.data.cantidad);
      if (res?.data?.count != null) return Number(res.data.count);
    } catch (e) {}
  }

  const list = await fetchList(path);
  return Array.isArray(list) ? list.length : 0;
}

export default api;
