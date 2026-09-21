import { z } from "zod";

export const subsidySchemaCreate = z
  .object({
    worker_id: z.string().min(1, "El trabajador es obligatorio"),
    type: z.string().min(1, "El tipo es obligatorio"),
    start_date: z.string().min(1, "La fecha de inicio es obligatoria"),
    end_date: z.string().min(1, "La fecha de fin es obligatoria"),
    // Vacío = se estima con el promedio de los 12 meses anteriores.
    amount: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v === "" || (!isNaN(Number(v)) && Number(v) >= 0),
        "El monto no es válido",
      ),
    reference: z.string().max(100, "Máximo 100 caracteres").optional(),
    notes: z.string().max(255, "Máximo 255 caracteres").optional(),
  })
  .refine((d) => !d.start_date || !d.end_date || d.end_date >= d.start_date, {
    message: "La fecha de fin no puede ser anterior a la de inicio",
    path: ["end_date"],
  });

export type SubsidyCreateSchema = z.infer<typeof subsidySchemaCreate>;
