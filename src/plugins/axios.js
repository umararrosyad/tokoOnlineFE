import axios from "axios";
import { useMainStore } from "@/stores/app"; // store pinia kamu

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Tambahkan interceptor untuk Authorization
api.interceptors.request.use((config) => {
  const mainStore = useMainStore();

  // Ambil token dari store atau localStorage
  const token = mainStore.user?.token || localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;