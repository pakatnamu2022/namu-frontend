import { z } from "zod";

export const equipmentTypeSchemaCreate = z.object({
  name: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Nombre es requerido",
    }),
});

export const equipmentTypeSchemaUpdate = equipmentTypeSchemaCreate.partial();

export type EquipmentTypeSchema = z.infer<typeof equipmentTypeSchemaCreate>;
