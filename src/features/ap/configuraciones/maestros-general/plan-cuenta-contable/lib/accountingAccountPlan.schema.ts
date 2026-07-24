import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const accountingAccountPlanSchemaCreate = z
  .object({
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
    is_detraction: z.boolean().optional().default(false),
    detraction_percentage: z.string().optional().default(""),
    sunat_concept_detraction_type_id: z.string().optional().default(""),
    enable_commercial: z.boolean().optional().default(false),
    enable_after_sales: z.boolean().optional().default(false),
  })
  .refine((data) => data.enable_commercial || data.enable_after_sales, {
    message: "Debe habilitar al menos una área: Comercial o Post Venta",
    path: ["enable_commercial"],
  })
  .refine(
    (data) => !data.is_detraction || data.detraction_percentage?.trim() !== "",
    {
      message:
        "El porcentaje de detracción es obligatorio cuando se marca como detracción",
      path: ["detraction_percentage"],
    }
  )
  .refine(
    (data) =>
      !data.detraction_percentage ||
      /^\d+$/.test(data.detraction_percentage.trim()),
    {
      message: "El porcentaje de detracción debe ser un número entero",
      path: ["detraction_percentage"],
    }
  )
  .refine(
    (data) =>
      !data.detraction_percentage ||
      !/^\d+$/.test(data.detraction_percentage.trim()) ||
      ["10", "12"].includes(data.detraction_percentage.trim()),
    {
      message: "El porcentaje de detracción debe ser 10 o 12",
      path: ["detraction_percentage"],
    }
  )
  .refine(
    (data) =>
      !data.is_detraction ||
      data.sunat_concept_detraction_type_id?.trim() !== "",
    {
      message:
        "El tipo de detracción es obligatorio cuando se marca como detracción",
      path: ["sunat_concept_detraction_type_id"],
    }
  );

export const accountingAccountPlanSchemaUpdate =
  accountingAccountPlanSchemaCreate.partial();

export type AccountingAccountPlanSchema = z.infer<
  typeof accountingAccountPlanSchemaCreate
>;
