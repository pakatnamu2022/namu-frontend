import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

// Schema base sin refinements
const shipmentsReceptionsSchemaBase = z.object({
  ap_vehicle_id: requiredStringId("El vehículo es requerido"),
  document_type: z.string().min(1, "El tipo de documento es requerido"),
  issuer_type: z.string().min(1, "El tipo de emisor es requerido"),
  ap_class_article_id: requiredStringId("La clase de artículo es requerida"),
  document_series_id: z.string().optional(),
  series: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Si está vacío, lo permitimos (la validación requerida se hace en otro lado)
        return val.startsWith("T") && val.length <= 4;
      },
      {
        message: "La serie debe empezar con 'T' y tener máximo 4 caracteres",
      }
    ),
  correlative: z.string().optional(),
  issue_date: z.union([z.literal(""), z.date()]).optional(),
  sede_transmitter_id: requiredStringId("La sede del emisor es requerida"),
  sede_receiver_id: z.string().optional(),
  transmitter_origin_id: requiredStringId("El origen del emisor es requerido"),
  receiver_destination_id: requiredStringId(
    "El destino del receptor es requerido"
  ),
  transmitter_id: requiredStringId("El emisor es requerido"),
  receiver_id: requiredStringId("El receptor es requerido"),
  total_packages: z.coerce
    .number({
      error: "El total de bultos es requerido",
    })
    .min(1, "El total de bultos debe ser al menos 1")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, "El total de bultos debe ser un número mayor a 0"),
  total_weight: z
    .string({
      error: "El peso total es requerido",
    })
    .min(0.1, "El peso total debe ser al menos 0.1")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, "El peso total debe ser un número mayor a 0"),
  file: z.instanceof(File).nullable().optional(),
  transport_company_id: requiredStringId(
    "La empresa de transporte es requerida"
  ),
  driver_doc: z
    .string()
    .min(8, "El documento del conductor debe tener al menos 8 caracteres"),
  license: z
    .string()
    .min(9, "La licencia debe tener al menos 9 caracteres")
    .max(10, "La licencia no puede exceder 10 caracteres"),
  plate: z
    .string()
    .min(6, "La placa debe tener al menos 6 caracteres")
    .max(7, "La placa no puede exceder 7 caracteres")
    .regex(
      /^[A-Z0-9-]+$/,
      "La placa solo puede contener letras mayúsculas, números y guiones"
    ),
  driver_name: z.string().min(1, "El nombre del conductor es requerido"),
  notes: z.string().optional(),
  transfer_reason_id: requiredStringId("El motivo de traslado es requerido"),
  transfer_modality_id: requiredStringId(
    "La modalidad de traslado es requerida"
  ),
});

// Schema para creación con validaciones condicionales
export const shipmentsReceptionsSchemaCreate = shipmentsReceptionsSchemaBase
  .refine(
    (data) => {
      // Si es Automotores (NOSOTROS), debe tener document_series_id
      if (data.issuer_type === "NOSOTROS") {
        return !!data.document_series_id;
      }
      // Si es Proveedor, debe tener manual_series y correlative
      if (data.issuer_type === "PROVEEDOR") {
        return !!data.series && !!data.correlative;
      }
      return true;
    },
    {
      message: "Debe completar los campos de serie y correlativo correctamente",
      path: ["document_series_id"],
    }
  )
  .refine(
    (data) => {
      // Si el documento NO es GUIA_REMISION, sede_transmitter_id es requerida
      if (data.document_type !== "GUIA_REMISION") {
        return !!data.sede_transmitter_id;
      }
      return true;
    },
    {
      message: "La sede origen es requerida",
      path: ["sede_transmitter_id"],
    }
  )
  .refine(
    (data) => {
      // Si el tipo de transporte es Público (ID: 83), el remitente no puede ser igual al transportista
      const TRANSPORTE_PUBLICO_ID = "83";
      if (data.transfer_modality_id === TRANSPORTE_PUBLICO_ID) {
        return data.receiver_destination_id !== data.transport_company_id;
      }
      return true;
    },
    {
      message:
        "En transporte público, el remitente no puede ser igual al transportista",
      path: ["transport_company_id"],
    }
  )
  .refine(
    (data) => {
      // sede_receiver_id es requerido excepto cuando el motivo de traslado es COMPRA u OTROS
      const TRANSFER_REASON_COMPRA = "15";
      const TRANSFER_REASON_OTROS = "23";

      if (
        data.transfer_reason_id !== TRANSFER_REASON_COMPRA &&
        data.transfer_reason_id !== TRANSFER_REASON_OTROS
      ) {
        return !!data.sede_receiver_id;
      }
      return true;
    },
    {
      message: "La sede destino es requerida para este motivo de traslado",
      path: ["sede_receiver_id"],
    }
  );

// Schema para actualización (todos los campos opcionales)
export const shipmentsReceptionsSchemaUpdate =
  shipmentsReceptionsSchemaBase.partial();

export type ShipmentsReceptionsSchema = z.infer<
  typeof shipmentsReceptionsSchemaCreate
>;

// Schema para checklist de recepción (update)
export const receptionChecklistSchemaUpdate = z.object({
  shipping_guide_id: z.number(),
  note: z.string().optional(),
  items_receiving: z.record(z.string(), z.number()).default({}),
});

export type ReceptionChecklistSchema = z.infer<
  typeof receptionChecklistSchemaUpdate
>;
