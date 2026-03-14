import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

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
      },
    ),
  correlative: z.string().optional(),
  issue_date: z.coerce.date().optional(),
  sede_transmitter_id: requiredStringId("La sede del emisor es requerida"),
  sede_receiver_id: z.string().optional(),
  transmitter_origin_id: requiredStringId("El origen del emisor es requerido"),
  receiver_destination_id: requiredStringId(
    "El destino del receptor es requerido",
  ),
  transmitter_id: requiredStringId("El emisor es requerido"),
  receiver_id: requiredStringId("El receptor es requerido"),
  total_packages: z
    .string()
    .min(1, "El total de bultos es requerido")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 1;
      },
      { message: "El total de bultos debe ser un número mayor o igual a 1" },
    ),
  total_weight: z
    .string()
    .min(1, "El peso total es requerido")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0.1;
      },
      { message: "El peso total debe ser un número mayor o igual a 0.1" },
    ),
  file: z.instanceof(File).nullable().optional(),
  transport_company_id: z.string().optional(),
  driver_doc: z.string().optional(),
  license: z.string().optional(),
  plate: z.string().optional(),
  driver_name: z.string().optional(),
  notes: z.string().optional(),
  transfer_reason_id: requiredStringId("El motivo de traslado es requerido"),
  transfer_modality_id: requiredStringId(
    "La modalidad de traslado es requerida",
  ),
});

// Schema para creación con validaciones condicionales
export const shipmentsReceptionsSchemaCreate = shipmentsReceptionsSchemaBase
  .refine(
    (data) => {
      // Si es Automotores (SYSTEM), debe tener document_series_id
      if (data.issuer_type === "SYSTEM") {
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
    },
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
    },
  )
  .refine(
    (data) => {
      if (data.transfer_modality_id === SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PUBLIC) {
        return !!data.transport_company_id && data.transport_company_id.trim().length > 0;
      }
      return true;
    },
    {
      message: "La empresa de transporte es requerida para transporte público",
      path: ["transport_company_id"],
    },
  )
  .refine(
    (data) => {
      if (data.transfer_modality_id === SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PUBLIC) {
        return data.receiver_destination_id !== data.transport_company_id;
      }
      return true;
    },
    {
      message: "En transporte público, el remitente no puede ser igual al transportista",
      path: ["transport_company_id"],
    },
  )
  .refine(
    (data) => {
      if (data.transfer_modality_id === SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PRIVATE) {
        return !!data.driver_doc && data.driver_doc.length >= 8;
      }
      return true;
    },
    {
      message: "El DNI del conductor debe tener al menos 8 caracteres",
      path: ["driver_doc"],
    },
  )
  .refine(
    (data) => {
      if (data.transfer_modality_id === SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PRIVATE) {
        return !!data.license && data.license.length >= 9 && data.license.length <= 10;
      }
      return true;
    },
    {
      message: "La licencia debe tener entre 9 y 10 caracteres",
      path: ["license"],
    },
  )
  .refine(
    (data) => {
      if (data.transfer_modality_id === SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PRIVATE) {
        return !!data.plate && data.plate.trim().length >= 6 && data.plate.trim().length <= 7 && /^[A-Z0-9-]+$/.test(data.plate);
      }
      return true;
    },
    {
      message: "La placa del vehículo es requerida (6-7 caracteres, mayúsculas, números y guiones)",
      path: ["plate"],
    },
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
    },
  )
  .refine(
    (data) => {
      if (data.transmitter_origin_id && data.receiver_destination_id) {
        return data.transmitter_origin_id !== data.receiver_destination_id;
      }
      return true;
    },
    {
      message: "El origen y el destino no pueden ser iguales",
      path: ["receiver_destination_id"],
    },
  );

// Schema para actualización (todos los campos opcionales)
export const shipmentsReceptionsSchemaUpdate =
  shipmentsReceptionsSchemaBase.partial();

export type ShipmentsReceptionsSchema = z.infer<
  typeof shipmentsReceptionsSchemaCreate
>;

// Schema de daños para checklist de recepción
export const receptionChecklistDamageSchema = z.object({
  damage_type: z.string().max(100),
  x_coordinate: z.number().nullable().optional(),
  y_coordinate: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  photo_url: z.string().optional(),
  photo_file: z.instanceof(File).optional(),
});

export type ReceptionChecklistDamageSchema = z.infer<
  typeof receptionChecklistDamageSchema
>;

// Schema para checklist de recepción (update)
export const receptionChecklistSchemaUpdate = z.object({
  shipping_guide_id: z.string(),
  note: z.string().optional(),
  kilometers: z.coerce
    .string()
    .min(1, "El kilometraje es requerido")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "El kilometraje debe ser un número mayor o igual a 0" },
    ),
  photo_front: z.instanceof(File).nullable().optional(),
  photo_back: z.instanceof(File).nullable().optional(),
  photo_left: z.instanceof(File).nullable().optional(),
  photo_right: z.instanceof(File).nullable().optional(),
  general_observations: z.string().max(1000).optional(),
  items_receiving: z.record(z.string(), z.string()),
  damages: z.array(receptionChecklistDamageSchema).default([]),
});

export type ReceptionChecklistSchema = z.infer<
  typeof receptionChecklistSchemaUpdate
>;
