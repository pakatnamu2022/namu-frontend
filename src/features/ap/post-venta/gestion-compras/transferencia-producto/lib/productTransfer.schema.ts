import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

// Schema para los detalles de productos
export const productTransferDetailSchema = z.object({
  product_id: requiredStringId("El producto es requerido"),
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
  unit_cost: z
    .string()
    .min(1, "El costo unitario es requerido")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "El costo unitario debe ser un número mayor o igual a 0" }
    ),
  notes: z.string().optional(),
});

// Schema base para transferencia de productos
const productTransferSchemaBase = z.object({
  warehouse_origin_id: requiredStringId("El almacén de origen es requerido"),
  warehouse_destination_id: requiredStringId("El almacén de destino es requerido"),
  movement_date: z.union([z.literal(""), z.date()]).optional(),
  notes: z.string().optional(),
  reason_in_out_id: requiredStringId("El motivo de entrada/salida es requerido"),
  driver_name: z.string().min(1, "El nombre del conductor es requerido"),
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
  transfer_reason_id: requiredStringId("El motivo de traslado es requerido"),
  transfer_modality_id: requiredStringId("La modalidad de traslado es requerida"),
  transport_company_id: requiredStringId("La empresa de transporte es requerida"),
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
  origin_ubigeo: z.string().min(1, "El ubigeo de origen es requerido"),
  origin_address: z.string().min(1, "La dirección de origen es requerida"),
  destination_ubigeo: z.string().min(1, "El ubigeo de destino es requerido"),
  destination_address: z.string().min(1, "La dirección de destino es requerida"),
  ruc_transport: z.string().min(11, "El RUC debe tener 11 caracteres").max(11, "El RUC debe tener 11 caracteres"),
  company_name_transport: z.string().min(1, "El nombre de la empresa de transporte es requerido"),
  details: z.array(productTransferDetailSchema).min(1, "Debe agregar al menos un producto"),
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
  );

// Schema para actualización (todos los campos opcionales)
export const productTransferSchemaUpdate = productTransferSchemaBase.partial();

export type ProductTransferSchema = z.infer<typeof productTransferSchemaCreate>;
export type ProductTransferDetailSchema = z.infer<typeof productTransferDetailSchema>;
