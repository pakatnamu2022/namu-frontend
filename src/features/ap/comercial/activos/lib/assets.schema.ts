import { z } from "zod";

export const assetSchemaCreate = z.object({
  ap_vehicle_id: z
    .string()
    .refine((v) => v.trim() !== "", { message: "El vehículo es requerido" }),
  worker_id: z
    .string()
    .refine((v) => v.trim() !== "", { message: "El trabajador es requerido" }),
  assigned_date: z
    .string()
    .refine((v) => v.trim() !== "", { message: "La fecha es requerida" }),
  observation: z.string().max(1000).optional(),
});

export type AssetSchema = z.infer<typeof assetSchemaCreate>;
