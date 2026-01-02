import { HotelReservationSchema } from "./hotelReservation.schema";

/**
 * Convierte los datos del schema de hotel reservation a FormData
 */
export function hotelReservationSchemaToFormData(
  data: HotelReservationSchema
): FormData {
  const formData = new FormData();

  // Agregar hotel_agreement_id si existe
  if (
    data.hotel_agreement_id !== null &&
    data.hotel_agreement_id !== undefined
  ) {
    formData.append("hotel_agreement_id", data.hotel_agreement_id.toString());
  }

  formData.append("hotel_name", data.hotel_name);
  formData.append("address", data.address);
  formData.append("phone", data.phone);
  formData.append("total_cost", data.total_cost.toString());

  if (data.document_number) {
    formData.append("document_number", data.document_number);
  }

  // Convertir fechas a formato ISO
  const checkinDate =
    typeof data.checkin_date === "string"
      ? new Date(data.checkin_date)
      : data.checkin_date;
  const checkoutDate =
    typeof data.checkout_date === "string"
      ? new Date(data.checkout_date)
      : data.checkout_date;

  formData.append("checkin_date", checkinDate.toISOString());
  formData.append("checkout_date", checkoutDate.toISOString());

  // Agregar archivo solo si existe (para modo de actualización puede ser opcional)
  if (data.receipt_file) {
    formData.append("receipt_file", data.receipt_file);
  }

  // Agregar notas si existen
  if (data.notes) {
    formData.append("notes", data.notes);
  }

  return formData;
}
