import axios from "axios";
import { errorToast } from "./core.function";

const MILLA_BASE = "https://api.grupopakatnamu.com/storage/app/";
// const MILLA_BASE = "http://localhost/web_millagp_2/storage/app/";
const MILLA_GP_BASEPATH = "http://localhost/milla-backend/public";
// const MILLA_GP_BASEPATH = "http://192.168.1.37/milla-backend/public";
// const MILLA_GP_BASEPATH = "http://192.168.2.23/milla-backend/public";
// const MILLA_GP_BASEPATH = "http://192.168.9.69/milla-backend/public";
// const MILLA_GP_BASEPATH = "http://192.168.18.122/milla-backend/public";
// const MILLA_GP_BASEPATH = "https://api.grupopakatnamu.com";

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
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      errorToast(
        "SESIÓN EXPIRADA",
        "Redirigiendo al inicio de sesión en 3 segundos"
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
    return Promise.reject(error);
  }
);

export { MILLA_BASE, MILLA_GP_BASEPATH, BASE_PATH, api, apiMilla };
