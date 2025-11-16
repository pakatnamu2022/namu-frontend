import { BUSINESS_PARTNERS } from "@/src/core/core.constants";
import {
  optionalStringId,
  requiredStringId,
} from "@/src/shared/lib/global.schema";
import { z } from "zod";

export const storeVisitsBaseObject = z.object({
  num_doc: z.string().min(1, "El número de documento es requerido"),
  full_name: z.string().refine((value) => value.trim() !== "", {
    message: "Nombres es requerido",
  }),
  phone: z
    .string()
    .min(9, "El teléfono es requerido")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Email opcional inválido")
    .optional()
    .or(z.literal("")),
  campaign: z.string().refine((value) => value.trim() !== "", {
    message: "Campaña es requerido",
  }),
  sede_id: requiredStringId("Sede es requerido"),
  worker_id: requiredStringId("Asesor es requerido"),
  vehicle_brand_id: requiredStringId("Marca es requerido"),
  document_type_id: requiredStringId("Tipo de Documento es requerido"),
  type: z.string().refine((value) => value.trim() !== "", {
    message: "Tipo es requerido",
  }),
  income_sector_id: z.string().refine((value) => value.trim() !== "", {
    message: "Ingreso es requerido",
  }),
  area_id: optionalStringId("Área es requerido"),
});

export const storeVisitsSchemaCreate = storeVisitsBaseObject.refine(
  (data) => {
    // Validación de longitud de documento según tipo
    if (data.document_type_id === BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID) {
      return data.num_doc.length === 8;
    }
    if (data.document_type_id === BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID) {
      return data.num_doc.length === 11;
    }
    return true;
  },
  {
    message: "",
    path: ["num_doc"],
  }
);

export const storeVisitsSchemaUpdate = storeVisitsBaseObject.partial().refine(
  (data) => {
    // Solo validar si los campos necesarios están presentes
    if (data.document_type_id && data.num_doc) {
      if (data.document_type_id === BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID) {
        return data.num_doc.length === 8;
      }
      if (data.document_type_id === BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID) {
        return data.num_doc.length === 11;
      }
    }
    return true;
  },
  {
    message: "",
    path: ["num_doc"],
  }
);

export type StoreVisitsSchema = z.infer<typeof storeVisitsSchemaCreate>;
