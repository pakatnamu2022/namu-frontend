import { api } from "@/core/api";
import type {
  DeliveryChecklistResource,
  DeliveryChecklistItemResource,
} from "./vehicleDelivery.interface";

const BASE = "/ap/commercial";

export async function getDeliveryChecklist(
  vehicleDeliveryId: number,
): Promise<DeliveryChecklistResource> {
  const { data } = await api.get<DeliveryChecklistResource>(
    `${BASE}/vehiclesDelivery/${vehicleDeliveryId}/checklist`,
  );
  return data;
}

export async function createDeliveryChecklist(payload: {
  vehicle_delivery_id: number;
  observations?: string | null;
  items?: Array<{
    description: string;
    quantity: number;
    unit?: string | null;
    source: string;
    source_id?: number | null;
    is_confirmed: boolean;
    observations?: string | null;
  }>;
}): Promise<DeliveryChecklistResource> {
  const { data } = await api.post<DeliveryChecklistResource>(
    `${BASE}/deliveryChecklist`,
    payload,
  );
  return data;
}

export async function updateDeliveryChecklist(
  id: number,
  payload: { observations?: string | null },
): Promise<DeliveryChecklistResource> {
  const { data } = await api.put<DeliveryChecklistResource>(
    `${BASE}/deliveryChecklist/${id}`,
    payload,
  );
  return data;
}

export async function updateDeliveryChecklistItem(
  checklistId: number,
  itemId: number,
  payload: {
    is_confirmed?: boolean;
    observations?: string | null;
    quantity?: number;
    description?: string;
    unit?: string | null;
  },
): Promise<DeliveryChecklistItemResource> {
  const { data } = await api.put<DeliveryChecklistItemResource>(
    `${BASE}/deliveryChecklist/${checklistId}/items/${itemId}`,
    payload,
  );
  return data;
}

export async function addDeliveryChecklistItem(
  checklistId: number,
  payload: {
    description: string;
    quantity: number;
    unit?: string | null;
    observations?: string | null;
  },
): Promise<DeliveryChecklistItemResource> {
  const { data } = await api.post<DeliveryChecklistItemResource>(
    `${BASE}/deliveryChecklist/${checklistId}/items`,
    payload,
  );
  return data;
}

export async function deleteDeliveryChecklistItem(
  checklistId: number,
  itemId: number,
): Promise<void> {
  await api.delete(
    `${BASE}/deliveryChecklist/${checklistId}/items/${itemId}`,
  );
}

export async function confirmDeliveryChecklist(
  id: number,
): Promise<DeliveryChecklistResource> {
  const { data } = await api.post<DeliveryChecklistResource>(
    `${BASE}/deliveryChecklist/${id}/confirm`,
  );
  return data;
}

export async function downloadDeliveryChecklistPdf(id: number): Promise<void> {
  const response = await api.get(`${BASE}/deliveryChecklist/${id}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `checklist-entrega-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
