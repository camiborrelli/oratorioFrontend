import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5174/api", // Adjust the base URL as needed
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers["Content-Type"] = "application/json";

  if (config.skipAuth) {
    return config;
  }

  let token = localStorage.getItem("Token");
  config.headers.Authorization = "Bearer " + token;

  return config;
});

export default api;
