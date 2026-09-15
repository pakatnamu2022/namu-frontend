import { z } from "zod";

export const contractTypeSchemaCreate = z.object({
  descripcion: z.string().min(1, "La descripción es obligatoria").max(200),
  anios: z.coerce.number().int().min(0).optional().or(z.literal("")),
  dias_vacaciones: z.coerce.number().min(0).optional().or(z.literal("")),
});

export const contractTypeSchemaUpdate = contractTypeSchemaCreate.partial();

export type ContractTypeSchema = z.infer<typeof contractTypeSchemaCreate>;
