import { type ModelComplete } from "@/core/core.interface.ts";
import { PerDiemPolicyResource } from "../../../gp/gestionhumana/viaticos/politica-viaticos/lib/perDiemPolicy.interface";

const ROUTE = "viaticos";
const ABSOLUTE_ROUTE = `/perfil/${ROUTE}`;

export const PER_DIEM_REQUEST: ModelComplete<PerDiemPolicyResource> = {
  MODEL: {
    name: "Solicitud de Viáticos",
    plural: "Solicitudes de Viáticos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "gp/gestion-humana/viaticos/per-diem-requests",
  QUERY_KEY: "perDiemRequests",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

/**
 *   const string ACCOMMODATION = "ACCOMMODATION";
  const int ACCOMMODATION_ID = 1;
  const string TRANSPORTATION = "TRANSPORTATION";
  const int TRANSPORTATION_ID = 2;
  const string MEALS = "MEALS";
  const int MEALS_ID = 3;
  const string BREAKFAST = "BREAKFAST";
  const int BREAKFAST_ID = 4;
  const string LUNCH = "LUNCH";
  const int LUNCH_ID = 5;
  const string DINNER = "DINNER";
  const int DINNER_ID = 6;
  const string LOCAL_TRANSPORT = "LOCAL_TRANSPORT";
  const int LOCAL_TRANSPORT_ID = 7;
 */

export const PER_DIEM_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PAID: "paid",
  PENDING_SETTLEMENT: "pending_settlement",
  IN_PROGRESS: "in_progress",
} as const;

export type PerDiemStatus =
  (typeof PER_DIEM_STATUS)[keyof typeof PER_DIEM_STATUS];

export const PER_DIEM_EXPENSE_TYPES = {
  ACCOMMODATION: "ACCOMMODATION",
  TRANSPORTATION: "TRANSPORTATION",
  MEALS: "MEALS",
  BREAKFAST: "BREAKFAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
  LOCAL_TRANSPORT: "LOCAL_TRANSPORT",
} as const;

export type PerDiemExpenseType =
  (typeof PER_DIEM_EXPENSE_TYPES)[keyof typeof PER_DIEM_EXPENSE_TYPES];

export const PER_DIEM_EXPENSE_TYPE_IDS: Record<PerDiemExpenseType, number> = {
  ACCOMMODATION: 1,
  TRANSPORTATION: 2,
  MEALS: 3,
  BREAKFAST: 4,
  LUNCH: 5,
  DINNER: 6,
  LOCAL_TRANSPORT: 7,
};

export const PER_DIEM_EXPENSE_TYPE_LABELS: Record<PerDiemExpenseType, string> =
  {
    ACCOMMODATION: "Alojamiento",
    TRANSPORTATION: "Transporte",
    MEALS: "Comidas",
    BREAKFAST: "Desayuno",
    LUNCH: "Almuerzo",
    DINNER: "Cena",
    LOCAL_TRANSPORT: "Transporte Local",
  };

export const PER_DIEM_EXPENSE_TYPE_ICONS: Record<PerDiemExpenseType, string> = {
  ACCOMMODATION: "HotelBedFill",
  TRANSPORTATION: "CarFill",
  MEALS: "RestaurantFill",
  BREAKFAST: "CoffeeFill",
  LUNCH: "BurgerFill",
  DINNER: "WineFill",
  LOCAL_TRANSPORT: "BusFill",
};
