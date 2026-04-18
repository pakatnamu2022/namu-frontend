import {
  requiredNumber,
  requiredStringId,
  requiredText,
} from "@/shared/lib/global.schema";
import { z } from "zod";

export const vehicleSchemaCreate = z
  .object({
    sede_id: requiredStringId("La sede es requerida"),
    plate: z
      .string()
      .length(6, "La placa debe tener exactamente 6 caracteres")
      .refine((value) => value.trim() !== "", {
        message: "Placa es requerida",
      }),
    vin: requiredText("El VIN es requerido", 17, 20),
    year: requiredNumber("El año es requerido", 1886),
    year_delivery: requiredNumber("El año de entrega es requerido", 1886),
    engine_number: requiredText("El número de motor es requerido", 1, 30),
    ap_models_vn_id: requiredStringId("El modelo es requerido"),
    vehicle_color_id: requiredStringId("El color es requerido"),
    engine_type_id: requiredStringId("El tipo de motor es requerido"),
    warehouse_physical_id: requiredStringId("El almacén físico es requerido"),
    type_operation_id: requiredStringId("El tipo de operación es requerido"),
    customer_id: requiredStringId("El cliente es requerido"),
    is_heavy: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.year && data.year_delivery) {
        return data.year_delivery >= data.year;
      }
      return true;
    },
    {
      message: "El año de entrega no puede ser menor al año de fabricación",
      path: ["year_delivery"],
    },
  );

export const vehicleSchemaUpdate = z
  .object({
    sede_id: requiredStringId("La sede es requerida").optional(),
    plate: z
      .string()
      .length(6, "La placa debe tener exactamente 6 caracteres")
      .refine((value) => value.trim() !== "", {
        message: "Placa es requerida",
      })
      .optional(),
    vin: requiredText("El VIN es requerido", 17, 17).optional(),
    year: requiredNumber("El año es requerido", 1886).optional(),
    year_delivery: requiredNumber(
      "El año de entrega es requerido",
      1886,
    ).optional(),
    engine_number: requiredText(
      "El número de motor es requerido",
      1,
      30,
    ).optional(),
    ap_models_vn_id: requiredStringId("El modelo es requerido").optional(),
    vehicle_color_id: requiredStringId("El color es requerido").optional(),
    engine_type_id: requiredStringId(
      "El tipo de motor es requerido",
    ).optional(),
    warehouse_physical_id: requiredStringId(
      "El almacén físico es requerido",
    ).optional(),
    type_operation_id: requiredStringId(
      "El tipo de operación es requerido",
    ).optional(),
    customer_id: requiredStringId("El cliente es requerido").optional(),
    is_heavy: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.year && data.year_delivery) {
        return data.year_delivery >= data.year;
      }
      return true;
    },
    {
      message: "El año de entrega no puede ser menor al año de fabricación",
      path: ["year_delivery"],
    },
  );

export type VehicleSchema = z.infer<typeof vehicleSchemaCreate>;
