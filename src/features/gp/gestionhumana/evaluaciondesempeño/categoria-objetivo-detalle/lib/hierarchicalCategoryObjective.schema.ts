import {optionalStringId} from "@/src/shared/lib/global.schema";
import {z} from "zod";

export const hierarchicalCategoryObjectiveSchemaCreate = z.object({
    objective_id: optionalStringId("El objetivo es obligatorio"),
});

export type HierarchicalCategoryObjectiveSchema = z.infer<typeof hierarchicalCategoryObjectiveSchemaCreate>;
