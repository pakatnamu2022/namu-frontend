import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const vehicleInspectionDamageSchema = z.object({
  damage_type: z.string().min(1, "Tipo de daño es requerido"),
  x_coordinate: z.number(),
  y_coordinate: z.number(),
  description: z.string().optional(),
  photo_url: z.string().optional(),
  photo_file: z.instanceof(File).optional(),
});

export const vehicleInspectionSchemaCreate = z.object({
  work_order_id: requiredStringId("Orden de trabajo es requerida"),
  dirty_unit: z.boolean().default(false),
  unit_ok: z.boolean().default(false),
  title_deed: z.boolean().default(false),
  soat: z.boolean().default(false),
  moon_permits: z.boolean().default(false),
  service_card: z.boolean().default(true),
  owner_manual: z.boolean().default(true),
  key_ring: z.boolean().default(true),
  wheel_lock: z.boolean().default(true),
  safe_glasses: z.boolean().default(true),
  radio_mask: z.boolean().default(true),
  lighter: z.boolean().default(true),
  floors: z.boolean().default(true),
  seat_cover: z.boolean().default(true),
  quills: z.boolean().default(true),
  antenna: z.boolean().default(true),
  glasses_wheel: z.boolean().default(true),
  emblems: z.boolean().default(true),
  spare_tire: z.boolean().default(true),
  fluid_caps: z.boolean().default(true),
  tool_kit: z.boolean().default(true),
  jack_and_lever: z.boolean().default(true),
  general_observations: z.string().max(1000).optional(),
  inspected_by: requiredStringId("Inspector es requerido"),
  inspection_date: z.union([z.literal(""), z.date()]),
  fuel_level: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Nivel de combustible es requerido",
    }),
  oil_level: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Nivel de aceite es requerido",
    }),
  mileage: z
    .string()
    .max(10)
    .refine((value) => value.trim() !== "", {
      message: "Kilometraje es requerido",
    }),
  damages: z.array(vehicleInspectionDamageSchema).default([]),
});

export const vehicleInspectionSchemaUpdate =
  vehicleInspectionSchemaCreate.partial();

export type VehicleInspectionSchema = z.infer<
  typeof vehicleInspectionSchemaCreate
>;
export type VehicleInspectionDamageSchema = z.infer<
  typeof vehicleInspectionDamageSchema
>;
