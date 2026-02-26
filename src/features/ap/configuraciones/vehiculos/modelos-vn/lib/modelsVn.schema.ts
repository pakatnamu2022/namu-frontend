import { requiredNumber, requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const modelsVnSchemaCreate = z.object({
  code: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  version: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Versión es requerido",
    }),
  power: z.string().max(50).default("0"),
  model_year: z.string().max(50).default("0"),
  wheelbase: z.string().max(50).default("0"),
  axles_number: z.string().max(50).default("0"),
  width: z.string().max(50).default("0"),
  length: z.string().max(50).default("0"),
  height: z.string().max(50).default("0"),
  seats_number: requiredNumber("Número de asientos es requerido"),
  doors_number: requiredNumber("Número de puertas es requerido"),
  net_weight: z.string().max(50).default("0"),
  gross_weight: z.string().max(50).default("0"),
  payload: z.string().max(50).default("0"),
  displacement: z.string().max(50).default("0"),
  cylinders_number: requiredNumber("Número de cilindros es requerido"),
  passengers_number: requiredNumber("Número de pasajeros es requerido"),
  wheels_number: requiredNumber("Número de ruedas es requerido"),
  distributor_price: requiredNumber(
    "Precio distribuidor debe ser un número válido",
  ),
  transport_cost: requiredNumber(
    "Costo de transporte debe ser un número válido",
  ),
  other_amounts: requiredNumber("Otros montos debe ser un número válido"),
  purchase_discount: requiredNumber(
    "Descuento de compra debe ser un número válido",
  ),
  igv_amount: requiredNumber("Importe IGV debe ser un número válido"),
  total_purchase_excl_igv: requiredNumber(
    "Total de compra sin IGV debe ser un número válido",
  ),
  total_purchase_incl_igv: requiredNumber(
    "Total de compra con IGV debe ser un número válido",
  ),
  sale_price: requiredNumber("Precio de venta debe ser un número válido"),
  margin: requiredNumber("Margen debe ser un número válido"),
  brand_id: requiredStringId("Marca es requerida"),
  family_id: requiredStringId("Familia es requerida"),
  class_id: requiredStringId("Clase de artículo es requerida"),
  fuel_id: requiredStringId("Tipo combustible es requerida"),
  vehicle_type_id: requiredStringId("Tipo de vehículo es requerida"),
  body_type_id: requiredStringId("Tipo carrocería es requerida"),
  traction_type_id: requiredStringId("Tipo tracción es requerida"),
  transmission_id: requiredStringId("Tipo transmisión es requerida"),
  currency_type_id: requiredStringId("Selecciona un tipo de moneda"),
  type_operation_id: z.string().optional(),
});

export const modelsVnSchemaUpdate = modelsVnSchemaCreate.partial();

export type ModelsVnSchema = z.infer<typeof modelsVnSchemaCreate>;
