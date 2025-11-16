import { optionalStringId } from "@/src/shared/lib/global.schema";
import { z } from "zod";

export const excludedSchemaCreate = z.object({
  person_id: optionalStringId("La persona es obligatoria"),
});

export const excludedSchemaUpdate = excludedSchemaCreate.partial();

export type ExcludedSchema = z.infer<typeof excludedSchemaCreate>;
