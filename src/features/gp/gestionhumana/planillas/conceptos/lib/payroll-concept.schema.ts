import { z } from "zod";

export const payrollConceptSchemaCreate = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  type: z.enum(
    ["EARNING", "DEDUCTION", "CONTRIBUTION"],
    "El tipo es requerido",
  ),
  category: z.enum(
    [
      "BASE_SALARY",
      "BONUS",
      "OVERTIME",
      "ALLOWANCE",
      "COMMISSION",
      "TAX",
      "SOCIAL_SECURITY",
      "PENSION",
      "LOAN",
      "OTHER",
    ],
    "La categoría es requerida",
  ),
  formula: z.string().optional(),
  formula_description: z.string().optional(),
  is_taxable: z.boolean().default(true),
  calculation_order: z.coerce.number().min(0).default(0),
  active: z.boolean().default(true),
});

export const payrollConceptSchemaUpdate = payrollConceptSchemaCreate.partial();

export type PayrollConceptSchema = z.infer<typeof payrollConceptSchemaCreate>;
