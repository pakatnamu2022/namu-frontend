import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const vehicleSchemaCreate = z.object({
  vin: z
    .string()
    .length(17, "El VIN debe tener exactamente 17 caracteres")
    .refine((value) => value.trim() !== "", {
      message: "VIN es requerido",
    }),
  year: z
    .number()
    .min(1900, "El año debe ser mayor o igual a 1900")
    .max(
      new Date().getFullYear() + 1,
      `El año no puede ser mayor a ${new Date().getFullYear() + 1}`
    ),
  engine_number: z
    .string()
    .max(30, "El número de motor no puede tener más de 30 caracteres")
    .refine((value) => value.trim() !== "", {
      message: "Número de motor es requerido",
    }),
  ap_models_vn_id: requiredStringId("El modelo es requerido"),
  vehicle_color_id: requiredStringId("El color es requerido"),
  engine_type_id: requiredStringId("El tipo de motor es requerido"),
  warehouse_physical_id: z.number().nullable().optional(),
});

export const vehicleSchemaUpdate = vehicleSchemaCreate.partial();

export type VehicleSchema = z.infer<typeof vehicleSchemaCreate>;
