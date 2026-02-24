import * as LucideReact from "lucide-react";

export interface ModelInterface {
  name: string;
  plural?: string;
  /**
   * true for feminine (e.g., "la", "una") and false for masculine (e.g., "el", "un").
   * Indicates the grammatical gender of the model name for correct article usage in Spanish.
   */
  gender: boolean;
  message?: string;
}

export interface ModelComplete<T = undefined> {
  MODEL: ModelInterface;
  ICON: keyof typeof LucideReact;
  ENDPOINT: string;
  QUERY_KEY: string;
  ROUTE: string;
  ABSOLUTE_ROUTE: string;
  ROUTE_ADD: string;
  ROUTE_UPDATE: string;
  ROUTE_DASHBOARD?: string;
  EMPTY?: T;
}

export interface Option {
  label: string | (() => React.ReactNode);
  value: string;
  description?: string;
  searchValue?: string; // Valor personalizado para búsqueda cuando el label no es texto
}
export interface MonthOption {
  value: string;
  label: string;
}

export interface MessageResponse {
  message: string;
}

export interface ParamsProps {
  params?: Record<string, any>;
}

export type Action =
  | "create"
  | "update"
  | "delete"
  | "fetch"
  | "close"
  | "manage";
