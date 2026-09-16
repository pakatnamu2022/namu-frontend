import { z } from "zod";

export const contractTemplateSchemaCreate = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(250),
  descripcion: z.string().max(250).optional().or(z.literal("")),
  contenido: z.string().min(1, "El contenido es obligatorio"),
});

export const contractTemplateSchemaUpdate =
  contractTemplateSchemaCreate.partial();

export type ContractTemplateSchema = z.infer<
  typeof contractTemplateSchemaCreate
>;
