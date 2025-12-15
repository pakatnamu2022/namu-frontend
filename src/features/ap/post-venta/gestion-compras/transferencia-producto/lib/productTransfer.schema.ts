import { BUSINESS_PARTNERS } from "@/core/core.constants";
import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

// Schema para los detalles de productos
export const productTransferDetailSchema = z.object({
  product_id: z.string().optional(),
  quantity: z
    .string()
    .min(1, "La cantidad es requerida")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 1;
      },
      { message: "La cantidad debe ser un número mayor o igual a 1" }
    ),
  unit_cost: z.string().optional(),
  notes: z.string().optional(),
});

// Schema base para transferencia de productos
const productTransferSchemaBase = z.object({
  item_type: z.enum(["PRODUCTO", "SERVICIO"]),
  warehouse_origin_id: requiredStringId("El almacén de origen es requerido"),
  document_type: z.string().min(1, "El tipo de documento es requerido"),
  issuer_type: z.string().min(1, "El tipo de emisor es requerido"),
  issue_date: z.union([z.literal(""), z.date()]).optional(),
  document_series_id: requiredStringId("La serie del documento es requerida"),
  warehouse_destination_id: requiredStringId(
    "El almacén de destino es requerido"
  ),
  movement_date: z.union([z.literal(""), z.date()]).optional(),
  notes: z.string().optional(),
  type_person_id: requiredStringId("El tipo de persona es requerido"),
  driver_name: z.string().optional(),
  driver_doc: z.string().optional(),
  license: z.string().optional(),
  plate: z.string().optional(),
  transfer_reason_id: requiredStringId("El motivo de traslado es requerido"),
  transfer_modality_id: requiredStringId(
    "La modalidad de traslado es requerida"
  ),
  transport_company_id: z.string().optional(),
  total_packages: z
    .string()
    .min(1, "El total de bultos es requerido")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 1;
      },
      { message: "El total de bultos debe ser un número mayor o igual a 1" }
    ),
  total_weight: z
    .string()
    .min(1, "El peso total es requerido")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0.1;
      },
      { message: "El peso total debe ser un número mayor o igual a 0.1" }
    ),
  details: z
    .array(productTransferDetailSchema)
    .min(1, "Debe agregar al menos un producto"),
  transmitter_origin_id: requiredStringId(
    "El remitente en el origen es requerido"
  ),
  receiver_destination_id: requiredStringId(
    "El receptor en el destino es requerido"
  ),
});

// Schema para creación con validaciones condicionales
export const productTransferSchemaCreate = productTransferSchemaBase
  .refine(
    (data) => {
      // El almacén de origen no puede ser igual al de destino
      return data.warehouse_origin_id !== data.warehouse_destination_id;
    },
    {
      message: "El almacén de origen no puede ser igual al almacén de destino",
      path: ["warehouse_destination_id"],
    }
  )
  .refine(
    (data) => {
      // Si es PRODUCTO, todos los detalles deben tener product_id
      if (data.item_type === "PRODUCTO") {
        return data.details.every((detail) => {
          return detail.product_id && detail.product_id.length > 0;
        });
      }
      return true;
    },
    {
      message: "Todos los productos deben ser seleccionados",
      path: ["details"],
    }
  )
  .refine(
    (data) => {
      // Si es SERVICIO, todos los detalles deben tener notes con al menos 6 caracteres
      if (data.item_type === "SERVICIO") {
        return data.details.every((detail) => {
          return detail.notes && detail.notes.length >= 6;
        });
      }
      return true;
    },
    {
      message: "Todas las descripciones deben tener al menos 6 caracteres",
      path: ["details"],
    }
  )
  .refine(
    (data) => {
      // Si es persona natural (704), debe tener DNI del conductor
      if (data.type_person_id === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID) {
        return !!data.driver_doc && data.driver_doc.length === 8;
      }
      return true;
    },
    {
      message: "El DNI del conductor es requerido para persona natural",
      path: ["driver_doc"],
    }
  )
  .refine(
    (data) => {
      // Si es persona natural (704), debe tener nombre del conductor
      if (data.type_person_id === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID) {
        return !!data.driver_name && data.driver_name.length > 0;
      }
      return true;
    },
    {
      message: "El nombre del conductor es requerido para persona natural",
      path: ["driver_name"],
    }
  )
  .refine(
    (data) => {
      // Si es persona natural (704), debe tener licencia
      if (data.type_person_id === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID) {
        return (
          !!data.license &&
          data.license.length >= 9 &&
          data.license.length <= 10
        );
      }
      return true;
    },
    {
      message: "La licencia de conducir es requerida para persona natural",
      path: ["license"],
    }
  )
  .refine(
    (data) => {
      // Si es persona natural (704), debe tener placa
      if (data.type_person_id === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID) {
        return !!data.plate && data.plate.length >= 6 && data.plate.length <= 7;
      }
      return true;
    },
    {
      message: "La placa del vehículo es requerida para persona natural",
      path: ["plate"],
    }
  )
  .refine(
    (data) => {
      // Si es persona jurídica (705), debe tener proveedor seleccionado
      if (data.type_person_id === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID) {
        return (
          !!data.transport_company_id && data.transport_company_id.length > 0
        );
      }
      return true;
    },
    {
      message: "El proveedor es requerido para persona jurídica",
      path: ["transport_company_id"],
    }
  );

// Schema para actualización (todos los campos opcionales)
export const productTransferSchemaUpdate = productTransferSchemaBase.partial();

export type ProductTransferSchema = z.infer<typeof productTransferSchemaCreate>;
export type ProductTransferDetailSchema = z.infer<
  typeof productTransferDetailSchema
>;
