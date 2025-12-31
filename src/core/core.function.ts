import { toast } from "sonner";
import { ACTIONS, ACTIONS_NAMES, IGV } from "./core.constants";
import type { Action, ModelInterface } from "./core.interface";

export const successToast = (
  body: string,
  description: string = new Date().toLocaleString()
) => {
  return toast.success(body, {
    description: description,
    action: {
      label: "Listo",
      onClick: () => toast.dismiss(),
    },
  });
};

export const errorToast = (
  body: string = "Error",
  description: string = new Date().toLocaleString()
) => {
  return toast.error(body, {
    description: description,
    action: {
      label: "Cerrar",
      onClick: () => toast.dismiss(),
    },
  });
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
  action: Action
) => string = ({ name, gender = true }, action) =>
  `${name} ${ACTIONS_NAMES[action]}${gender ? "a" : "o"} correctamente.`;

export const ERROR_MESSAGE = (
  { name, gender }: ModelInterface,
  action: Action,
  message?: string
): string => {
  if (message && message.trim() !== "") {
    return message;
  }
  return `Error al ${ACTIONS[action]} ${gender ? "la" : "el"} ${name}.`;
};

export const SUBTITLE: ({ name }: ModelInterface, action: Action) => string = (
  { name },
  action
) => `Aquí puedes ${ACTIONS[action]} ${name.toLowerCase()}.`;

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
