import { requiredNumber, requiredStringId } from "@/shared/lib/global.schema";
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
  ap_work_order_id: requiredStringId("Orden de trabajo es requerida"),
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
  // Detalles de trabajo
  oil_change: z.boolean().default(false),
  check_level_lights: z.boolean().default(false),
  general_lubrication: z.boolean().default(false),
  rotation_inspection_cleaning: z.boolean().default(false),
  insp_filter_basic_checks: z.boolean().default(false),
  tire_pressure_inflation_check: z.boolean().default(false),
  alignment_balancing: z.boolean().default(false),
  pad_replace_disc_resurface: z.boolean().default(false),
  other_work_details: z.string().max(500).optional(),
  // Requerimiento del cliente
  customer_requirement: z.string().max(500).optional(),
  // Explicación de resultados
  explanation_work_performed: z.boolean().default(false),
  price_explanation: z.boolean().default(false),
  confirm_additional_work: z.boolean().default(false),
  clarification_customer_concerns: z.boolean().default(false),
  exterior_cleaning: z.boolean().default(false),
  interior_cleaning: z.boolean().default(false),
  keeps_spare_parts: z.boolean().default(false),
  valuable_objects: z.boolean().default(false),
  // Items de cortesía
  courtesy_seat_cover: z.boolean().default(false),
  paper_floor: z.boolean().default(false),
  general_observations: z.string().max(1000).optional(),
  inspection_date: z.string().min(1, "La fecha y hora de inicio es requerida"),
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
  mileage: requiredNumber("Kilometraje es requerido"),
  damages: z.array(vehicleInspectionDamageSchema).default([]),
  customer_signature: z.string().min(1, "Firma del cliente es requerida"),
  washed: z.boolean().default(true),
  // Fotos del vehículo
  photo_front: z.instanceof(File, { message: "Foto delantera es requerida" }),
  photo_back: z.instanceof(File, { message: "Foto trasera es requerida" }),
  photo_left: z.instanceof(File, { message: "Foto izquierda es requerida" }),
  photo_right: z.instanceof(File, { message: "Foto derecha es requerida" }),
  photo_optional_1: z.instanceof(File).optional().nullable(),
  photo_optional_2: z.instanceof(File).optional().nullable(),
});

export const vehicleInspectionSchemaUpdate =
  vehicleInspectionSchemaCreate.partial();

export type VehicleInspectionSchema = z.infer<
  typeof vehicleInspectionSchemaCreate
>;
export type VehicleInspectionDamageSchema = z.infer<
  typeof vehicleInspectionDamageSchema
>;
