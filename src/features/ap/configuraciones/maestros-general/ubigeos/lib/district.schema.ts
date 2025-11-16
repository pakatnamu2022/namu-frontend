import { requiredStringId } from "@/src/shared/lib/global.schema";
import { z } from "zod";

export const districtSchemaCreate = z.object({
  name: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Distrito es requerido",
    }),
  ubigeo: z
    .string()
    .refine((value) => value.trim() !== "", {
      message: "Ubigeo es requerido",
    })
    .refine((value) => value.trim().length === 6, {
      message: "Ubigeo debe tener 6 caracteres",
    }),
  province_id: requiredStringId("Provincia es requerido"),
  department_id: requiredStringId("Departamento es requerido"),
});

export const districtSchemaUpdate = districtSchemaCreate.partial();

export type DistrictSchema = z.infer<typeof districtSchemaCreate>;
