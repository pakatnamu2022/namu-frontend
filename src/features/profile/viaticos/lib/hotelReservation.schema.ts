import { requiredStringId, requiredText } from "@/shared/lib/global.schema";
import { z } from "zod";

export const hotelReservationSchema = z
  .object({
    hotel_agreement_id: requiredStringId("Convenio de Hotel"),
    ruc: requiredText("RUC del Hotel", 11, 11),
    hotel_name: requiredText("Nombre del Hotel", 1, 255),
    address: requiredText("Dirección del Hotel", 1, 500),
    phone: requiredText("Teléfono del Hotel", 1),
    checkin_date: z
      .union([z.string(), z.date()])
      .refine((value) => value !== "", {
        message: "Fecha de check-in es requerida",
      }),
    checkout_date: z
      .union([z.string(), z.date()])
      .refine((value) => value !== "", {
        message: "Fecha de check-out es requerida",
      }),
    total_cost: z
      .union([z.string(), z.number()])
      .transform((val) => {
        if (typeof val === "string") {
          const parsed = parseFloat(val);
          return isNaN(parsed) ? 0 : parsed;
        }
        return val;
      })
      .refine((val) => val >= 0, {
        message: "Costo total debe ser mayor o igual a 0",
      }),
    document_number: requiredText("Número de documento", 1, 100),
    receipt_file: z
      .instanceof(File, {
        message: "El comprobante es requerido",
      })
      .refine((file) => file && file.size > 0, {
        message: "Debes adjuntar un comprobante",
      })
      .refine(
        (file) => {
          const validTypes = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
          ];
          return file && validTypes.includes(file.type);
        },
        {
          message: "El archivo debe ser PDF, JPG, JPEG o PNG",
        },
      )
      .refine((file) => file && file.size <= 10 * 1024 * 1024, {
        message: "El archivo no debe superar los 10MB",
      })
      .optional(),
    notes: z.string().max(1000).optional().default(""),
  })
  .refine(
    (data) => {
      if (
        typeof data.checkin_date === "string" &&
        typeof data.checkout_date === "string"
      ) {
        const checkin = new Date(data.checkin_date);
        const checkout = new Date(data.checkout_date);
        return checkout > checkin;
      }
      return true;
    },
    {
      message:
        "La fecha de check-out debe ser posterior a la fecha de check-in",
      path: ["checkout_date"],
    },
  );

export type HotelReservationSchema = z.infer<typeof hotelReservationSchema>;
