import { z } from "zod";

const requiredId = (message: string) =>
  z
    .union([z.string(), z.number()])
    .refine((v) => v !== "" && v !== null && v !== undefined && Number(v) > 0, {
      message,
    });

const optionalId = z.union([z.string(), z.number()]).optional().or(z.literal(""));

export const contractSchemaCreate = z.object({
  empleado_id: requiredId("El trabajador es obligatorio"),
  tipo_contrato_id: requiredId("El tipo de contrato es obligatorio"),
  template_contrato_id: requiredId("La plantilla es obligatoria"),
  sede_id: requiredId("La sede es obligatoria"),
  cargo_id: requiredId("El cargo es obligatorio"),
  sueldo: z.coerce.number({ message: "Ingrese el sueldo" }).min(0),
  fecha_inicio_actividades: z.string().optional().or(z.literal("")),
  fecha_inicio_contrato: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de inicio es obligatoria"),
  fecha_fin_contrato: z.string().optional().or(z.literal("")),
  observacion: z.string().max(500).optional().or(z.literal("")),
  grupo_contrato: z.string().max(100).optional().or(z.literal("")),
  contrato_principal: optionalId,
  convenio: z.string().max(50).optional().or(z.literal("")),
  firmante_id: optionalId,
  firmante_sec_id: optionalId,
  lote: z.string().max(150).optional().or(z.literal("")),
});

export const contractSchemaUpdate = contractSchemaCreate.partial();

export type ContractSchema = z.infer<typeof contractSchemaCreate>;
