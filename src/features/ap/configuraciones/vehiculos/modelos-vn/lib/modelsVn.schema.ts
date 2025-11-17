import { requiredStringId } from "@/shared/lib/global.schema";
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
  power: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Potencia es requerido",
    }),
  model_year: z.coerce
    .number({
      error: "El año del modelo es requerido",
    })
    .int("El año debe ser un número entero")
    .min(1900, "El año no puede ser menor a 1900")
    .max(
      new Date().getFullYear() + 500,
      `El año no puede ser mayor a ${new Date().getFullYear() + 500}`
    ),
  wheelbase: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Distancia de ejes es requerido",
    }),
  axles_number: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Número de ejes es requerido",
    }),
  width: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Ancho es requerido",
    }),
  length: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Largo es requerido",
    }),
  height: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Altura es requerido",
    }),
  seats_number: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Número de asientos es requerido",
    }),
  doors_number: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Número de puertas es requerida",
    }),
  net_weight: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Peso neto es requerida",
    }),
  gross_weight: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Peso bruto es requerida",
    }),
  payload: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Carga útil es requerida",
    }),
  displacement: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Cilindrada es requerido",
    }),
  cylinders_number: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Número de cilindros es requerido",
    }),
  passengers_number: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Número de pasajeros es requerido",
    }),
  wheels_number: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Número de ruedas es requerido",
    }),
  distributor_price: z.coerce
    .number()
    .min(0, "Precio distribuidor debe ser al menos 0"),
  transport_cost: z.coerce
    .number()
    .min(0, "Costo de transporte debe ser al menos 0"),
  other_amounts: z.coerce.number().min(0, "Otros importes debe ser al menos 0"),
  purchase_discount: z.coerce
    .number()
    .min(0, "Descuento de compra debe ser al menos 0"),
  igv_amount: z.coerce.number().min(0, "Importe IGV debe ser al menos 0"),
  total_purchase_excl_igv: z.coerce
    .number()
    .min(0, "Total compra sin IGV debe ser al menos 0"),
  total_purchase_incl_igv: z.coerce
    .number()
    .min(0, "Total compra con IGV debe ser al menos 0"),
  sale_price: z.coerce.number().min(0, "Precio de venta debe ser al menos 0"),
  margin: z.coerce.number().min(0, "Margen debe ser al menos 0"),
  brand_id: requiredStringId("Marca es requerida"),
  family_id: requiredStringId("Familia es requerida"),
  class_id: requiredStringId("Clase de artículo es requerida"),
  fuel_id: requiredStringId("Tipo combustible es requerida"),
  vehicle_type_id: requiredStringId("Tipo de vehículo es requerida"),
  body_type_id: requiredStringId("Tipo carrocería es requerida"),
  traction_type_id: requiredStringId("Tipo tracción es requerida"),
  transmission_id: requiredStringId("Tipo transmisión es requerida"),
  currency_type_id: requiredStringId("Selecciona un tipo de moneda"),
});

export const modelsVnSchemaUpdate = modelsVnSchemaCreate.partial();

export type ModelsVnSchema = z.infer<typeof modelsVnSchemaCreate>;
