import { z } from "zod";

const optionalNumberString = (label: string, max?: number) =>
  z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === "" ||
        (!isNaN(Number(v)) &&
          Number(v) >= 0 &&
          (max === undefined || Number(v) <= max)),
      `${label} no es válido`,
    );

export const lifePolicySchemaCreate = z
  .object({
    company_id: z.string().min(1, "La empresa es obligatoria"),
    insurer: z.string().max(255).optional(),
    policy_number: z.string().max(100).optional(),
    start_date: z.string().min(1, "La fecha de inicio es obligatoria"),
    end_date: z.string().min(1, "La fecha de fin es obligatoria"),
    // Tasa mensual en porcentaje (ej. 0.26 = 0.26%). Vacío = tasa general del sistema.
    monthly_rate: optionalNumberString("La tasa mensual", 100),
    exclusion: optionalNumberString("La exclusión"),
    net_premium: optionalNumberString("La prima neta"),
  })
  .refine((d) => !d.start_date || !d.end_date || d.end_date > d.start_date, {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["end_date"],
  });

export type LifePolicyCreateSchema = z.infer<typeof lifePolicySchemaCreate>;

export const lifePolicyWorkerSchema = z.object({
  worker_id: z.string().min(1, "El trabajador es obligatorio"),
  insured_salary: optionalNumberString("El sueldo asegurado"),
});

export type LifePolicyWorkerSchema = z.infer<typeof lifePolicyWorkerSchema>;
