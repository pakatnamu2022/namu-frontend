import axios from "axios";
import { errorToast } from "./core.function";

const MILLA_BASE = "https://api.grupopakatnamu.com/storage/app/";
// const MILLA_BASE = "http://localhost/web_millagp_2/storage/app/";
// const MILLA_GP_BASEPATH = "http://localhost/milla-backend/public";
// const MILLA_GP_BASEPATH = "http://192.168.1.37/milla-backend/public";
// const MILLA_GP_BASEPATH = "http://192.168.2.23/milla-backend/public";
// const MILLA_GP_BASEPATH = "http://192.168.9.69/milla-backend/public";
// const MILLA_GP_BASEPATH = "http://192.168.18.122/milla-backend/public";
const MILLA_GP_BASEPATH = "https://api.grupopakatnamu.com";

const API_URL = "/api";
const BASE_PATH = "";

const api = axios.create({
  // LIBRO DE RECLAMACIONES
  baseURL: MILLA_GP_BASEPATH + API_URL,
});
const apiMilla = axios.create({ baseURL: MILLA_GP_BASEPATH + API_URL });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
let isRedirecting = false;

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect if already on login page
      const isOnLoginPage = window.location.pathname === "/" || window.location.pathname === "/login";

      if (!isOnLoginPage && !isRedirecting) {
        isRedirecting = true;
        console.error("No autenticado: Redirigiendo al inicio de sesión...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
        errorToast("SESIÓN EXPIRADA", "Redirigiendo al inicio de sesión");
        // Redirección inmediata sin espera
        window.location.href = "/";
      }
      // Rechazamos con un error específico que NO debe mostrarse en los componentes
      return new Promise(() => {}); // Promesa que nunca se resuelve para detener la ejecución
    }
    return Promise.reject(error);
  }
);

export { MILLA_BASE, MILLA_GP_BASEPATH, BASE_PATH, api, apiMilla };