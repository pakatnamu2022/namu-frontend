import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { VehicleInspectionResource } from "../../inspeccion-vehiculo/lib/vehicleInspection.interface";
import { WorkOrderItemResource } from "../../orden-trabajo-item/lib/workOrderItem.interface";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import { OrderQuotationResource } from "../../cotizacion/lib/proforma.interface";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { WorkOrderLabourResource } from "../../orden-trabajo-labor/lib/workOrderLabour.interface";
import { WorkOrderPartsResource } from "../../orden-trabajo-repuesto/lib/workOrderParts.interface";
import { ApMastersResource } from "@/features/ap/ap-master/lib/apMasters.interface";
import { CurrencyTypesResource } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.interface";

export interface WorkOrderResponse {
  data: WorkOrderResource[];
  links: Links;
  meta: Meta;
}

export interface WorkOrderResource {
  id: number;
  correlative: string;
  mileage: string;
  fuel_level: string;
  order_quotation_id: number | null;
  appointment_planning_id: string;
  vehicle_inspection_id: string;
  vehicle_id: string;
  currency_id: string;
  vehicle: VehicleResource;
  vehicle_plate: string;
  vehicle_vin: string;
  status_id: string;
  advisor_id: string;
  advisor_name: string;
  sede_id: string;
  sede_name: string;
  opening_date: string;
  estimated_delivery_date: string;
  actual_delivery_date: string;
  diagnosis_date: string;
  observations: string;
  is_invoiced: boolean;
  is_guarantee: boolean;
  is_recall: boolean;
  description_recall: string | null;
  type_recall: "ROJO" | "AMARILLO" | "VERDE" | null;
  is_inspection_completed: boolean;
  type_currency: CurrencyTypesResource;
  vehicle_inspection: VehicleInspectionResource | null;
  items: WorkOrderItemResource[];
  order_quotation?: OrderQuotationResource;
  labours: WorkOrderLabourResource[];
  parts: WorkOrderPartsResource[];
  advances: ElectronicDocumentResource[];
  status: ApMastersResource;
}

export interface WorkOrderRequest {
  appointment_planning_id?: string;
  vehicle_id: string;
  sede_id: string;
  opening_date: string | Date;
  estimated_delivery_date: string | Date;
  diagnosis_date: string | Date;
  observations: string;
}

export interface WorkOrderPaymentSummary {
  work_order_id: number;
  correlative: string;
  payment_summary: {
    labour_cost: number;
    parts_cost: number;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    total_advances: number;
    remaining_balance: number;
  };
}

export const GROUP_COLORS: Record<number, { badge: string; input: string }> = {
  1: {
    badge: "#1A388B", // blue-500
    input: "border-blue-400 bg-blue-50 text-primary font-semibold",
  },
  2: {
    badge: "#22c55e", // green-500
    input: "border-green-400 bg-green-50 text-green-900 font-semibold",
  },
  3: {
    badge: "#a855f7", // purple-500
    input: "border-purple-400 bg-purple-50 text-purple-900 font-semibold",
  },
  4: {
    badge: "#f97316", // orange-500
    input: "border-orange-400 bg-orange-50 text-orange-900 font-semibold",
  },
  5: {
    badge: "#ec4899", // pink-500
    input: "border-pink-400 bg-pink-50 text-pink-900 font-semibold",
  },
  6: {
    badge: "#06b6d4", // cyan-500
    input: "border-cyan-400 bg-cyan-50 text-cyan-900 font-semibold",
  },
  7: {
    badge: "#6366f1", // indigo-500
    input: "border-indigo-400 bg-indigo-50 text-indigo-900 font-semibold",
  },
  8: {
    badge: "#f43f5e", // rose-500
    input: "border-rose-400 bg-rose-50 text-rose-900 font-semibold",
  },
  9: {
    badge: "#14b8a6", // teal-500
    input: "border-teal-400 bg-teal-50 text-teal-900 font-semibold",
  },
  10: {
    badge: "#f59e0b", // amber-500
    input: "border-amber-400 bg-amber-50 text-amber-900 font-semibold",
  },
};

export const DEFAULT_GROUP_COLOR = {
  badge: "#6b7280", // gray-500
  input: "border-gray-400 bg-gray-50 text-gray-900 font-semibold",
};

export interface getWorkOrderProps {
  params?: Record<string, any>;
}
