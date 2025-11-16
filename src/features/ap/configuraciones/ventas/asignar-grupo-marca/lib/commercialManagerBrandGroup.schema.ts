import { requiredStringId } from "@/src/shared/lib/global.schema";
import { z } from "zod";

export const commercialManagerBrandGroupSchemaCreate = z.object({
  year: z.number().int().min(2000, "El año es requerido"),
  month: z.number().int().min(1, "El mes es requerido").max(12, "Mes inválido"),
  brand_group_id: requiredStringId("Selecciona un Grupo de Marca"),
  commercial_managers: z
    .array(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1, "El Gerente Comercial es requerido"),
      })
    )
    .min(1, { message: "Debe seleccionar al menos un Gerente Comercial" }),
});

export const commercialManagerBrandGroupSchemaUpdate =
  commercialManagerBrandGroupSchemaCreate.partial();

export type CommercialManagerBrandGroupSchema = z.infer<
  typeof commercialManagerBrandGroupSchemaCreate
>;
