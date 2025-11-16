import { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";

import {
  ElectronicDocumentSchema,
  CreditNoteSchema,
  DebitNoteSchema,
} from "./electronicDocument.schema";
import { ELECTRONIC_DOCUMENT } from "./electronicDocument.constants";
import {
  ElectronicDocumentResource,
  ElectronicDocumentResponse,
  AdvancePaymentsByQuotationResponse,
  ElectronicDocumentMigrationLogsResponse,
  ElectronicDocumentMigrationHistoryResponse,
} from "./electronicDocument.interface";
import { ParamsProps } from "@/core/core.interface";

const { ENDPOINT } = ELECTRONIC_DOCUMENT;

export async function getElectronicDocuments(
  params?: ParamsProps
): Promise<ElectronicDocumentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ElectronicDocumentResponse>(ENDPOINT, config);
  return data;
}

export async function getNextCorrelativeElectronicDocument(
  document_type: number,
  series: number
): Promise<{ number: string }> {
  const config: AxiosRequestConfig = {
    params: {
      document_type,
      series,
    },
  };
  const { data } = await api.get<{ number: string }>(
    `${ENDPOINT}/nextDocumentNumber`,
    config
  );
  return data;
}

export async function getAllElectronicDocuments(
  params?: ParamsProps
): Promise<ElectronicDocumentResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<ElectronicDocumentResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findElectronicDocumentById(
  id: number
): Promise<ElectronicDocumentResource> {
  const response = await api.get<ElectronicDocumentResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function getElectronicDocumentsByEntity(
  module: string,
  entityType: string,
  entityId: number
): Promise<ElectronicDocumentResource[]> {
  const response = await api.get<ElectronicDocumentResource[]>(
    `${ENDPOINT}/by-entity/${module}/${entityType}/${entityId}`
  );
  return response.data;
}

export async function storeElectronicDocument(
  data: ElectronicDocumentSchema
): Promise<ElectronicDocumentResource> {
  const response = await api.post<ElectronicDocumentResource>(ENDPOINT, data);
  return response.data;
}

export async function updateElectronicDocument(
  id: number,
  data: ElectronicDocumentSchema
): Promise<ElectronicDocumentResource> {
  const response = await api.put<ElectronicDocumentResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteElectronicDocument(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}

export async function sendElectronicDocumentToSunat(
  id: number
): Promise<ElectronicDocumentResource> {
  const response = await api.post<ElectronicDocumentResource>(
    `${ENDPOINT}/${id}/send`
  );
  return response.data;
}

export async function queryElectronicDocumentStatus(
  id: number
): Promise<ElectronicDocumentResource> {
  const response = await api.post<ElectronicDocumentResource>(
    `${ENDPOINT}/${id}/query`
  );
  return response.data;
}

export async function cancelElectronicDocument(
  id: number,
  reason: string
): Promise<ElectronicDocumentResource> {
  const response = await api.post<ElectronicDocumentResource>(
    `${ENDPOINT}/${id}/cancel`,
    { reason }
  );
  return response.data;
}

export async function getNextCreditNoteNumber(
  id: number,
  series: number,
  document_type: number
): Promise<{ number: string }> {
  const config: AxiosRequestConfig = {
    params: {
      series,
      document_type,
    },
  };

  const response = await api.get<{ number: string }>(
    `${ENDPOINT}/${id}/nextCreditNoteNumber`,
    config
  );
  return response.data;
}

/**
 * Transforms CreditNoteSchema data to match backend API requirements
 */
function enrichCreditNotePayload(
  documentId: number,
  data: CreditNoteSchema,
  fecha_de_emision: string
) {
  return {
    original_document_id: documentId,
    sunat_concept_credit_note_type_id: Number(
      data.sunat_concept_credit_note_type_id
    ),
    series: Number(data.series),
    fecha_de_emision: fecha_de_emision,
    observaciones: data.observaciones,
    enviar_automaticamente_a_la_sunat: data.enviar_automaticamente_a_la_sunat,
    enviar_automaticamente_al_cliente: data.enviar_automaticamente_al_cliente,
    items: data.items,
  };
}

export async function createCreditNote(
  id: number,
  data: CreditNoteSchema,
  fecha_de_emision: string
): Promise<ElectronicDocumentResource> {
  const payload = enrichCreditNotePayload(id, data, fecha_de_emision);
  const response = await api.post<ElectronicDocumentResource>(
    `${ENDPOINT}/${id}/credit-note`,
    payload
  );
  return response.data;
}

export async function updateCreditNote(
  id: number,
  data: CreditNoteSchema,
  fecha_de_emision: string
): Promise<ElectronicDocumentResource> {
  const payload = enrichCreditNotePayload(id, data, fecha_de_emision);
  const response = await api.put<ElectronicDocumentResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return response.data;
}

export async function getNextDebitNoteNumber(
  id: number,
  series: number,
  document_type: number
): Promise<{ number: string }> {
  const config: AxiosRequestConfig = {
    params: {
      series,
      document_type,
    },
  };

  const response = await api.get<{ number: string }>(
    `${ENDPOINT}/${id}/nextDebitNoteNumber`,
    config
  );
  return response.data;
}

/**
 * Transforms DebitNoteSchema data to match backend API requirements
 */
function enrichDebitNotePayload(
  documentId: number,
  data: DebitNoteSchema,
  fecha_de_emision: string
) {
  return {
    original_document_id: documentId,
    sunat_concept_debit_note_type_id: Number(
      data.sunat_concept_debit_note_type_id
    ),
    series: Number(data.series),
    fecha_de_emision: fecha_de_emision,
    observaciones: data.observaciones,
    enviar_automaticamente_a_la_sunat: data.enviar_automaticamente_a_la_sunat,
    enviar_automaticamente_al_cliente: data.enviar_automaticamente_al_cliente,
    items: data.items,
  };
}

export async function createDebitNote(
  id: number,
  data: DebitNoteSchema,
  fecha_de_emision: string
): Promise<ElectronicDocumentResource> {
  const payload = enrichDebitNotePayload(id, data, fecha_de_emision);
  const response = await api.post<ElectronicDocumentResource>(
    `${ENDPOINT}/${id}/debit-note`,
    payload
  );
  return response.data;
}

export async function getAdvancePaymentsByVehicle(
  vehicleId: number
): Promise<AdvancePaymentsByQuotationResponse> {
  const response = await api.get<AdvancePaymentsByQuotationResponse>(
    `/ap/commercial/vehicles/${vehicleId}/invoices`
  );
  return response.data;
}

export async function getAdvancePaymentsByQuotation(
  quotationId: number
): Promise<AdvancePaymentsByQuotationResponse> {
  const response = await api.get<AdvancePaymentsByQuotationResponse>(
    `/ap/commercial/purchaseRequestQuote/${quotationId}/invoices`
  );
  return response.data;
}

export async function getMigrationLogs(
  purchaseOrderId: number
): Promise<ElectronicDocumentMigrationLogsResponse> {
  const { data } = await api.get<ElectronicDocumentMigrationLogsResponse>(
    `${ENDPOINT}/${purchaseOrderId}/logs`
  );
  return data;
}

export async function getMigrationHistory(
  purchaseOrderId: number
): Promise<ElectronicDocumentMigrationHistoryResponse> {
  const { data } = await api.get<ElectronicDocumentMigrationHistoryResponse>(
    `${ENDPOINT}/${purchaseOrderId}/history`
  );
  return data;
}
