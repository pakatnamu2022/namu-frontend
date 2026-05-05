import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const perDiemRequestSchema = z.object({
  company_id: requiredStringId("La empresa es requerida"),
  sede_service_id: requiredStringId("El servicio de la sede es requerido"),
  start_date: z.string().min(1, {
    message: "La fecha de inicio es requerida",
  }),
  end_date: z.string().min(1, {
    message: "La fecha de fin es requerida",
  }),
  purpose: z
    .string()
    .max(500)
    .refine((value) => value.trim() !== "", {
      message: "El propósito es requerido",
    }),
  notes: z.string().max(500).optional(),
  status: z.string().max(50).optional(),
  with_active: z.boolean(), // para saber si va con un activo de la empresa
  with_request: z.boolean(), // para saber si solicita presupuesto o va rendir gastos
});

export const perDiemRequestSchemaUpdate = perDiemRequestSchema.partial({
  notes: true,
  status: true,
});

export type PerDiemRequestSchema = z.infer<typeof perDiemRequestSchema>;
export type PerDiemRequestSchemaUpdate = z.infer<
  typeof perDiemRequestSchemaUpdate
>;
