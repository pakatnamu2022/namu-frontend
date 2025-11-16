import {optionalStringId} from "@/shared/lib/global.schema";
import {z} from "zod";

export const hierarchicalCategoryCompetenceSchemaCreate = z.object({
    competence_id: optionalStringId("La competencia es obligatoria"),
});

export type HierarchicalCategoryCompetenceSchema = z.infer<typeof hierarchicalCategoryCompetenceSchemaCreate>;
