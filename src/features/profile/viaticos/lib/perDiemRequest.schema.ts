import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const perDiemRequestSchemaCreate = z.object({
  company_id: requiredStringId("La empresa es requerida"),
  company_service_id: requiredStringId(
    "El servicio de la empresa es requerido"
  ),
  start_date: z.union([z.literal(""), z.date()], {
    message: "La fecha de inicio es requerida",
  }),
  end_date: z.union([z.literal(""), z.date()], {
    message: "La fecha de fin es requerida",
  }),
  purpose: z
    .string()
    .max(500)
    .refine((value) => value.trim() !== "", {
      message: "El propósito es requerido",
    }),
  notes: z.string().max(500).optional().default(""),
  district_id: requiredStringId("El distrito es requerido"),
  with_active: z.boolean().default(false), // para saber si va con un activo de la empresa
  with_request: z.boolean().default(false), // para saber si solicita presupuesto o va rendir gastos
});

export const perDiemRequestSchemaUpdate = z.object({
  company_id: requiredStringId("La empresa es requerida"),
  company_service_id: requiredStringId(
    "El servicio de la empresa es requerido"
  ),
  start_date: z.union([z.literal(""), z.date()], {
    message: "La fecha de inicio es requerida",
  }),
  end_date: z.union([z.literal(""), z.date()], {
    message: "La fecha de fin es requerida",
  }),
  purpose: z
    .string()
    .max(500)
    .refine((value) => value.trim() !== "", {
      message: "El propósito es requerido",
    }),
  notes: z.string().max(500).optional().default(""),
  status: z.string().max(50).optional(),
  district_id: requiredStringId("El distrito es requerido"),
  with_active: z.boolean().default(false), // para saber si va con un activo de la empresa
  with_request: z.boolean().default(false), // para saber si solicita presupuesto o va rendir gastos
});

export type PerDiemRequestSchema = z.infer<typeof perDiemRequestSchemaCreate>;
export type PerDiemRequestSchemaUpdate = z.infer<
  typeof perDiemRequestSchemaUpdate
>;
