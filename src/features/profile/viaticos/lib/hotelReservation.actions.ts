"use server";

import { api } from "@/core/api";
import { toLocalDateTimeString } from "@/core/core.function";
import type { AxiosRequestConfig } from "axios";
import { HotelReservationRequest } from "./hotelReservation.interface";
import { HotelReservationResource } from "./perDiemRequest.interface";
import { HotelAgreementResource } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.interface";

/**
 * Obtiene los convenios de hotel activos
 */
export async function getActiveHotelAgreements(): Promise<
  HotelAgreementResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: "true",
    },
  };
  const { data } = await api.get<HotelAgreementResource[]>(
    "gp/gestion-humana/viaticos/hotel-agreements/active",
    config,
  );
  return data;
}

/**
 * Crea una reserva de hotel para una solicitud de viáticos
 * @param requestId - ID de la solicitud de viáticos
 * @param requestData - Datos de la reserva
 */
export async function createHotelReservation(
  requestId: number,
  requestData: HotelReservationRequest,
): Promise<HotelReservationResource> {
  const formData = new FormData();

  // Agregar campos básicos
  if (
    requestData.hotel_agreement_id !== null &&
    requestData.hotel_agreement_id !== undefined
  ) {
    formData.append(
      "hotel_agreement_id",
      requestData.hotel_agreement_id.toString(),
    );
  }
  formData.append("ruc", requestData.ruc);
  formData.append("hotel_name", requestData.hotel_name);
  formData.append("address", requestData.address);
  formData.append("phone", requestData.phone);
  formData.append("total_cost", requestData.total_cost.toString());

  // Agregar document_number si existen
  if (requestData.document_number) {
    formData.append("document_number", requestData.document_number);
  }

  formData.append("checkin_date", toLocalDateTimeString(requestData.checkin_date));
  formData.append("checkout_date", toLocalDateTimeString(requestData.checkout_date));

  // Agregar archivo (obligatorio)
  formData.append("receipt_file", requestData.receipt_file);

  // Agregar notas si existen
  if (requestData.notes) {
    formData.append("notes", requestData.notes);
  }

  const { data } = await api.post<HotelReservationResource>(
    `gp/gestion-humana/viaticos/per-diem-requests/${requestId}/hotel-reservation`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}

/**
 * Obtiene una reserva de hotel por su ID
 * @param reservationId - ID de la reserva
 */
export async function findHotelReservationById(
  reservationId: number,
): Promise<HotelReservationResource> {
  const { data } = await api.get<HotelReservationResource>(
    `gp/gestion-humana/viaticos/hotel-reservations/${reservationId}`,
  );
  return data;
}

/**
 * Libera una reserva de hotel, eliminando la reserva y su gasto vinculado
 * para permitir que la solicitud pueda cancelarse
 * @param reservationId - ID de la reserva a liberar
 */
export async function releaseHotelReservation(
  reservationId: number,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `gp/gestion-humana/viaticos/hotel-reservations/${reservationId}/release`,
  );
  return data;
}

/**
 * Actualiza una reserva de hotel existente
 * @param reservationId - ID de la reserva a actualizar
 * @param formData - FormData con los datos actualizados
 */
export async function updateHotelReservation(
  reservationId: number,
  formData: FormData,
): Promise<HotelReservationResource> {
  const { data } = await api.post<HotelReservationResource>(
    `gp/gestion-humana/viaticos/hotel-reservations/${reservationId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}
