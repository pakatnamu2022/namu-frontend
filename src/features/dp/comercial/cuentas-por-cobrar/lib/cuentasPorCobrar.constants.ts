export const CUENTAS_POR_COBRAR = {
  ENDPOINT: "/dp/commercial/cuentasPorCobrar",
  QUERY_KEY: "dp-cuentas-por-cobrar",
  ROUTE: "cuentas-por-cobrar",
  ABSOLUTE_ROUTE: "/dp/comercial/cuentas-por-cobrar",
  COMPANY: "deposito",
} as const;

export const OVERDUE_STATUS_COLORS: Record<string, string> = {
  Vencido: "bg-red-100 text-red-700 border-red-200",
  "Por Vencer": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Al día": "bg-green-100 text-green-700 border-green-200",
  Vigente: "bg-green-100 text-green-700 border-green-200",
};

export const DEFAULT_OVERDUE_STATUS_COLOR = "bg-gray-100 text-gray-700 border-gray-200";
