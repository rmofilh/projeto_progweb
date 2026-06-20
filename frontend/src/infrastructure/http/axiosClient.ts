import axios from "axios";
import { TOKEN_KEY } from "../config";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined"
    ? (localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token"))
    : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento genérico de erros
    if (error.response?.status === 401) {
      console.warn("Não autorizado. Necessário re-autenticar.");
    }
    return Promise.reject(error);
  }
);
