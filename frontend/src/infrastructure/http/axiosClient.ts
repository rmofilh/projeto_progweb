import axios from "axios";
import { TOKEN_KEY } from "../config";

function getBaseURL(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url && typeof window !== "undefined") {
    console.warn(
      "NEXT_PUBLIC_API_URL is not configured. " +
      "Set it in .env.local or Vercel environment variables."
    );
    return "";
  }
  return url || "";
}

export const axiosClient = axios.create({
  baseURL: getBaseURL(),
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
