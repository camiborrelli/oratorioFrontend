import axios from "axios";

// Determine API base URL with sensible defaults:
// - If `VITE_API_URL` is provided at build/deploy time, use it.
// - In production builds, if no VITE_API_URL is set, default to same origin
//   (`window.location.origin`) so deploys calling the backend on the same host
//   work without hardcoded `localhost` addresses.
// - In development, fall back to the dev backend on the local machine
//   using the current hostname (helps testing from mobile devices).
const runtimeHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";
let BASE = import.meta.env.VITE_API_URL;
if (!BASE) {
  if (import.meta.env.PROD) {
    // production: prefer same origin when no explicit API URL provided
    BASE =
      typeof window !== "undefined"
        ? window.location.origin
        : `http://${runtimeHost}:5000`;
  } else {
    // development: use host's machine on port 5000 by default
    BASE = `http://${runtimeHost}:5000`;
  }
}

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
