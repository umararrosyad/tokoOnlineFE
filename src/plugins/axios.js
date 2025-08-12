import axios from "axios";
import { useMainStore } from "@/stores/app"; // store pinia kamu

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Tambahkan interceptor untuk Authorization dan header ngrok
api.interceptors.request.use((config) => {
  const mainStore = useMainStore();

  // Ambil token dari store atau localStorage
  const token = mainStore.user?.token || localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Jika baseURL (atau full URL) mengandung domain ngrok, tambahkan header khusus
  if (config.url && config.url.includes("ngrok-free.app")) {
    config.headers["ngrok-skip-browser-warning"] = "1";
  }

  // Jika kamu menggunakan baseURL, kadang config.url relatif (misal '/api')
  // jadi untuk cek domain, gabungkan baseURL + url:
  const fullUrl = config.baseURL
    ? new URL(config.url, config.baseURL).href
    : config.url;

  if (fullUrl.includes("ngrok-free.app")) {
    config.headers["ngrok-skip-browser-warning"] = "1";
  }

  return config;
});

export default api;
  