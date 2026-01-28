import { z } from "zod";

// Schema para VehicleData
const vehicleDataSchema = z.object({
  vin: z
    .string()
    .min(17, "El VIN debe tener 17 caracteres")
    .max(17, "El VIN debe tener 17 caracteres"),
  year: z
    .number()
    .min(1900, "El año debe ser mayor a 1900")
    .max(new Date().getFullYear() + 1, "El año no es válido"),
  engine_number: z.string().min(1, "El número de motor es requerido"),
  ap_models_vn_id: z.number().min(1, "El modelo es requerido"),
  vehicle_color_id: z.number().min(1, "El color es requerido"),
  engine_type_id: z.number().min(1, "El tipo de motor es requerido"),
  plate: z.string().optional(),
  ap_vehicle_status_id: z.number().min(1, "El estado del vehículo es requerido"),
  warehouse_id: z.number().min(1, "El almacén es requerido"),
});

// Schema para items
const exhibitionVehicleItemSchema = z
  .object({
    item_type: z.enum(["vehicle", "equipment"], {
      message: "El tipo de item es requerido",
    }),
    description: z.string().min(1, "La descripción es requerida"),
    quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
    observaciones: z.string().optional(),
    status: z.boolean(),
    vehicle_data: vehicleDataSchema.optional(),
  })
  .refine(
    (data) => {
      // Si el tipo es "vehicle", debe tener vehicle_data
      if (data.item_type === "vehicle") {
        return !!data.vehicle_data;
      }
      return true;
    },
    {
      message: "Los datos del vehículo son requeridos para items de tipo vehículo",
      path: ["vehicle_data"],
    }
  );

// Schema base para creación
export const exhibitionVehiclesSchemaCreate = z.object({
  supplier_id: z.number().min(1, "El proveedor es requerido"),
  guia_number: z.string().min(1, "El número de guía es requerido"),
  guia_date: z.union([z.string(), z.date()]),
  llegada: z.union([z.string(), z.date()]),
  ubicacion_id: z.number().min(1, "La ubicación es requerida"),
  advisor_id: z.number().nullable().optional(),
  propietario_id: z.number().nullable().optional(),
  ap_vehicle_status_id: z.number().min(1, "El estado del vehículo es requerido"),
  pedido_sucursal: z.string().optional(),
  dua_number: z.string().min(1, "El número DUA es requerido"),
  observaciones: z.string().optional(),
  status: z.boolean(),
  items: z
    .array(exhibitionVehicleItemSchema)
    .min(1, "Debe actualizar al menos un item"),
});

// Schema para actualización (todos los campos opcionales excepto items)
export const exhibitionVehiclesSchemaUpdate = exhibitionVehiclesSchemaCreate.partial().extend({
  items: z
    .array(exhibitionVehicleItemSchema)
    .min(1, "Debe actualizar al menos un item"),
});

export type ExhibitionVehiclesSchemaCreate = z.infer<
  typeof exhibitionVehiclesSchemaCreate
>;

export type ExhibitionVehiclesSchemaUpdate = z.infer<
  typeof exhibitionVehiclesSchemaUpdate
>;

export type ExhibitionVehiclesSchema =
  | ExhibitionVehiclesSchemaCreate
  | ExhibitionVehiclesSchemaUpdate;
