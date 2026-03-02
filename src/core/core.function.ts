import { toast } from "sonner";
import { ACTIONS, ACTIONS_NAMES, IGV } from "./core.constants";
import type { Action, ModelInterface } from "./core.interface";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

export const successToast = (
  body: string,
  description: string = new Date().toLocaleString(),
) => {
  return toast.success(body, {
    description,
    action: {
      label: "Listo",
      onClick: () => toast.dismiss(),
    },
  });
};

export const errorToast = (
  body: string = "Error",
  description: string = new Date().toLocaleString(),
) => {
  return toast.error(body, {
    description,
    action: {
      label: "Cerrar",
      onClick: () => toast.dismiss(),
    },
  });
};

export const warningToast = (
  body: string,
  description: string = new Date().toLocaleString(),
) => {
  return toast.warning(body, {
    description,
    action: {
      label: "Entendido",
      onClick: () => toast.dismiss(),
    },
  });
};

export const infoToast = (
  body: string,
  description: string = new Date().toLocaleString(),
) => {
  return toast.info(body, {
    description,
    action: {
      label: "Ok",
      onClick: () => toast.dismiss(),
    },
  });
};

export const loadingToast = (body: string = "Cargando...") => {
  return toast.loading(body);
};

export const promiseToast = <T>(
  promise: Promise<T>,
  messages: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
  } = {},
) => {
  return toast.promise(promise, {
    loading: messages.loading ?? "Procesando...",
    success: messages.success ?? "Operación exitosa",
    error: messages.error ?? "Ocurrió un error",
  });
};

export const dismissToast = (toastId?: string | number) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export const objectToFormData = (obj: any) => {
  const formData = new FormData();
  for (const key in obj) {
    formData.append(key, obj[key]);
  }
  return formData;
};

export const SUCCESS_MESSAGE: (
  { name, gender }: ModelInterface,
  action: Action,
) => string = ({ name, gender = true }, action) =>
  `${name} ${ACTIONS_NAMES[action]}${gender ? "a" : "o"} correctamente.`;

export const ERROR_MESSAGE = (
  { name, gender }: ModelInterface,
  action: Action,
  message?: string,
): string => {
  if (message && message.trim() !== "") {
    return message;
  }
  return `Error al ${ACTIONS[action]} ${gender ? "la" : "el"} ${name}.`;
};

export const SUBTITLE: ({ name }: ModelInterface, action: Action) => string = (
  { name },
  action,
) =>
  `${ACTIONS[action].charAt(0).toUpperCase() + ACTIONS[action].slice(1)} ${name.toLowerCase()}.`;

function roundTwoDecimalPlacesUp(valor: number): number {
  return Math.ceil(valor * 100) / 100;
}

export function calculateIGV(valor: number, incluyeIGV: boolean) {
  let base = 0;
  let igv = 0;
  let total = 0;

  if (incluyeIGV) {
    base = valor / IGV.FACTOR;
    igv = valor - base;
    total = valor;
  } else {
    base = valor;
    igv = base * IGV.RATE;
    total = base + igv;
  }

  return {
    base: roundTwoDecimalPlacesUp(base),
    igv: roundTwoDecimalPlacesUp(igv),
    total: roundTwoDecimalPlacesUp(total),
  };
}

export function generateYear(yearStart: number = 2025): number[] {
  const years: number[] = [];
  const yearActual = currentYear();
  for (let year = yearStart; year <= yearActual; year++) {
    years.push(year);
  }

  return years;
}

export function currentYear(): number {
  return new Date().getFullYear();
}

export function currentMonth(): number {
  return new Date().getMonth() + 1;
}

// Helper function to clean text: uppercase and remove special characters
export const cleanText = (text: string): string => {
  return text.toUpperCase().replace(/[^A-Z0-9\s]/g, ""); // Only allow letters, numbers, and spaces
};

// Calcular el lunes de la semana actual
export const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Calcular el domingo de la semana actual
export const getSunday = (date: Date) => {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

// Calcular el primer día del mes actual
export const getFirstDayOfMonth = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);
  return firstDay;
};

// Calcular el día actual (hasta el momento actual del mes)
export const getCurrentDayOfMonth = (date: Date) => {
  const currentDay = new Date(date);
  currentDay.setHours(23, 59, 59, 999);
  return currentDay;
};

// Obtener la fecha actual en formato local YYYY-MM-DD sin problemas de zona horaria
export const getTodayLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha ISO o Date a un formato legible
 * @param date - Fecha en formato ISO string o Date
 * @param dateFormat - Formato deseado (por defecto: "dd/MM/yyyy")
 * @returns Fecha formateada o "-" si la fecha es inválida
 */
export const formatDate = (
  date: string | Date | null | undefined,
  dateFormat: string = "dd/MM/yyyy",
): string => {
  if (!date) return "-";

  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;

    if (!isValid(parsedDate)) return "-";

    return format(parsedDate, dateFormat, { locale: es });
  } catch {
    return "-";
  }
};

/**
 * Formatea una fecha ISO o Date a formato fecha y hora
 * @param date - Fecha en formato ISO string o Date
 * @param dateFormat - Formato deseado (por defecto: "dd/MM/yyyy HH:mm")
 * @returns Fecha y hora formateada o "-" si la fecha es inválida
 */
export const formatDateTime = (
  date: string | Date | null | undefined,
  dateFormat: string = "dd/MM/yyyy HH:mm",
): string => {
  return formatDate(date, dateFormat);
};

/**
 * Formatea una fecha ISO o Date a formato corto (dd/MM/yy)
 * @param date - Fecha en formato ISO string o Date
 * @returns Fecha en formato corto o "-" si la fecha es inválida
 */
export const formatDateShort = (
  date: string | Date | null | undefined,
): string => {
  return formatDate(date, "dd/MM/yy");
};

/**
 * Formatea una fecha ISO o Date a formato largo legible
 * @param date - Fecha en formato ISO string o Date
 * @returns Fecha en formato largo (ej: "7 de febrero de 2026") o "-" si la fecha es inválida
 */
export const formatDateLong = (
  date: string | Date | null | undefined,
): string => {
  return formatDate(date, "d 'de' MMMM 'de' yyyy");
};

export const TEXT_NEW = ({ name, gender }: ModelInterface) =>
  `Nuev${gender ? "a" : "o"} ${name}`;
export const TEXT_UPDATE = ({ name }: ModelInterface) => `Actualizar ${name}`;
