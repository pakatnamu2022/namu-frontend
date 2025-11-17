// lib/parameter.schema.ts
import { z } from "zod";

export const parameterDetailSchema = z.object({
  id: z.number().optional(),
  label: z.string().min(1, "Etiqueta requerida"),
  from: z.coerce.number({ error: "Debe ser número" }),
  to: z.coerce.number({ error: "Debe ser número" }),
});

const baseParameterSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  type: z.enum(["objectives", "competences", "final"], {
    message: "Los tipos válidos son: objectives, competences, final",
  }),
  detailsCount: z.enum(["4", "5", "6"]).optional(),
  details: z.array(parameterDetailSchema).min(1, "Agrega al menos un detalle"),
});

// acepta parciales para .partial()
const refineAll = (
  val: Partial<z.infer<typeof baseParameterSchema>>,
  ctx: z.RefinementCtx
) => {
  const n = val.details?.length ?? 0;
  const count = val.detailsCount ? Number(val.detailsCount) : undefined;

  if (count !== undefined && n !== count) {
    ctx.addIssue({
      code: "custom",
      path: ["details"],
      message: `Debes tener exactamente ${count} detalles`,
    });
  }
  if (!n) return;

  // Primer from = 0
  if (val.details![0].from !== 0 && val.type !== "competences") {
    ctx.addIssue({
      code: "custom",
      path: ["details", 0, "from"],
      message: "Debe iniciar en 0",
    });
  }

  // Validar rangos y encadenado
  for (let i = 0; i < n; i++) {
    const d = val.details![i]!;
    if (d.from! < 0 || d.to! < 0 || d.from! >= d.to!) {
      ctx.addIssue({
        code: "custom",
        path: ["details", i, "to"],
        message: "El rango máximo debe ser mayor al rango mínimo",
      });
    }
    if (i > 0) {
      const prevTo = val.details![i - 1]!.to!;
      if (d.from! !== prevTo && val.type !== "competences") {
        ctx.addIssue({
          code: "custom",
          path: ["details", i, "from"],
          message: "Debe ser igual al 'Mayor' del nivel anterior",
        });
      }
      if (d.from! <= prevTo && val.type === "competences") {
        ctx.addIssue({
          code: "custom",
          path: ["details", i, "from"],
          message: "Debe ser mayor al 'Mayor' del nivel anterior",
        });
      }
    }
  }
};

export const parameterSchemaCreate = baseParameterSchema
  .extend({
    detailsCount: z.enum(["4", "5", "6"]),
    details: z.array(parameterDetailSchema).min(4, "Agrega detalles"),
  })
  .superRefine(refineAll);

export const parameterSchemaUpdate = baseParameterSchema
  .partial()
  .superRefine(refineAll);

export type ParameterDetailSchema = z.infer<typeof parameterDetailSchema>;
export type ParameterSchema = z.infer<typeof parameterSchemaCreate>;

export type ParameterCreateSchema = z.infer<typeof parameterSchemaCreate>;
export type ParameterUpdateSchema = z.infer<typeof parameterSchemaUpdate>;
