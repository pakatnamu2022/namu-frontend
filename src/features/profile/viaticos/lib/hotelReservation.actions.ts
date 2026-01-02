"use server";

import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  HotelReservationRequest,
  HotelReservationResponse,
  ActiveHotelAgreement,
} from "./hotelReservation.interface";

/**
 * Obtiene los convenios de hotel activos
 */
export async function getActiveHotelAgreements(): Promise<
  ActiveHotelAgreement[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: "true",
    },
  };
  const { data } = await api.get<ActiveHotelAgreement[]>(
    "gp/gestion-humana/viaticos/hotel-agreements/active",
    config
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
  requestData: HotelReservationRequest
): Promise<HotelReservationResponse> {
  const formData = new FormData();

  // Agregar campos básicos
  if (
    requestData.hotel_agreement_id !== null &&
    requestData.hotel_agreement_id !== undefined
  ) {
    formData.append(
      "hotel_agreement_id",
      requestData.hotel_agreement_id.toString()
    );
  }
  formData.append("hotel_name", requestData.hotel_name);
  formData.append("address", requestData.address);
  formData.append("phone", requestData.phone);
  formData.append("total_cost", requestData.total_cost.toString());

  // Agregar document_number si existen
  if (requestData.document_number) {
    formData.append("document_number", requestData.document_number);
  }

  // Convertir fechas a formato ISO con hora
  const checkinDate =
    typeof requestData.checkin_date === "string"
      ? new Date(requestData.checkin_date)
      : requestData.checkin_date;
  const checkoutDate =
    typeof requestData.checkout_date === "string"
      ? new Date(requestData.checkout_date)
      : requestData.checkout_date;

  formData.append("checkin_date", checkinDate.toISOString());
  formData.append("checkout_date", checkoutDate.toISOString());

  // Agregar archivo (obligatorio)
  formData.append("receipt_file", requestData.receipt_file);

  // Agregar notas si existen
  if (requestData.notes) {
    formData.append("notes", requestData.notes);
  }

  const { data } = await api.post<HotelReservationResponse>(
    `gp/gestion-humana/viaticos/per-diem-requests/${requestId}/hotel-reservation`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

/**
 * Obtiene una reserva de hotel por su ID
 * @param reservationId - ID de la reserva
 */
export async function findHotelReservationById(
  reservationId: number
): Promise<HotelReservationResponse> {
  const { data } = await api.get<HotelReservationResponse>(
    `gp/gestion-humana/viaticos/hotel-reservations/${reservationId}`
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
  formData: FormData
): Promise<HotelReservationResponse> {
  // Agregar _method para simular PUT
  formData.append("_method", "PUT");

  const { data } = await api.post<HotelReservationResponse>(
    `gp/gestion-humana/viaticos/hotel-reservations/${reservationId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}
