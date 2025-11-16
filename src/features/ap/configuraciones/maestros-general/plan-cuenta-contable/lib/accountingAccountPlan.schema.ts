import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const accountingAccountPlanSchemaCreate = z.object({
  account: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Cuenta es requerido",
    }),
  code_dynamics: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Código Dynamics es requerido",
    }),
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  accounting_type_id: requiredStringId("Tipo de cuenta contable es requerido"),
  status: z.boolean().optional().default(true),
});

export const accountingAccountPlanSchemaUpdate =
  accountingAccountPlanSchemaCreate.partial();

export type AccountingAccountPlanSchema = z.infer<
  typeof accountingAccountPlanSchemaCreate
>;
