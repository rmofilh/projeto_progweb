import axios from "axios";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de exemplo para Auth (pronto para integração futura)
axiosClient.interceptors.request.use((config) => {
  // Simulando uma busca futura do token (pode vir de cookies ou local storage)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
