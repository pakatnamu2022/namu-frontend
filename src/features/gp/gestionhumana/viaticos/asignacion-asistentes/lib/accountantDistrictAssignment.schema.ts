import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const accountantDistrictAssignmentSchemaCreate = z.object({
  worker_id: requiredStringId("Trabajador es requerido"),
  district_id: requiredStringId("Distrito es requerido"),
});

export const accountantDistrictAssignmentSchemaUpdate =
  accountantDistrictAssignmentSchemaCreate.partial();

export type AccountantDistrictAssignmentSchema = z.infer<
  typeof accountantDistrictAssignmentSchemaCreate
>;
