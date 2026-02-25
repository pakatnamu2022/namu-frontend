import {
  requiredNumber,
  requiredStringId,
  requiredText,
} from "@/shared/lib/global.schema";
import { z } from "zod";

export const vehicleSchemaCreate = z.object({
  sede_id: requiredStringId("La sede es requerida"),
  plate: z
    .string()
    .length(6, "La placa debe tener exactamente 6 caracteres")
    .refine((value) => value.trim() !== "", {
      message: "Placa es requerida",
    }),
  vin: requiredText("El VIN es requerido", 17, 17),
  year: requiredNumber("El año es requerido", 1886),
  engine_number: requiredText("El número de motor es requerido", 1, 30),
  ap_models_vn_id: requiredStringId("El modelo es requerido"),
  vehicle_color_id: requiredStringId("El color es requerido"),
  engine_type_id: requiredStringId("El tipo de motor es requerido"),
  warehouse_physical_id: requiredStringId("El almacén físico es requerido"),
  type_operation_id: requiredStringId("El tipo de operación es requerido"),
  customer_id: requiredStringId("El cliente es requerido"),
});

export const vehicleSchemaUpdate = vehicleSchemaCreate.partial();

export type VehicleSchema = z.infer<typeof vehicleSchemaCreate>;
