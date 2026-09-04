import { z } from "zod";

const requiredId = (message: string) =>
  z
    .union([z.string(), z.number()])
    .refine((v) => v !== "" && v !== null && v !== undefined && Number(v) > 0, {
      message,
    });

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .optional()
  .or(z.literal(""));

export const applicantSchemaCreate = z.object({
  proceso_postulacion_id: requiredId("El proceso de postulación es obligatorio"),
  nombre_completo: z.string().min(1, "El nombre completo es obligatorio").max(255),
  vat: z.string().min(1, "El documento es obligatorio").max(25),
  vat2: z.string().max(25).optional().or(z.literal("")),
  vat3: z.string().max(25).optional().or(z.literal("")),
  sexo: z.string().optional().or(z.literal("")),
  fecha_nacimiento: optionalDate,
  estado_civil: z.string().optional().or(z.literal("")),
  fecha_estado_civil: optionalDate,
  nacionalidad: z.string().optional().or(z.literal("")),
  lugar_nacimiento: z.string().optional().or(z.literal("")),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  cel_personal: z.string().optional().or(z.literal("")),
  cel_refencia: z.string().optional().or(z.literal("")),
  tel_referencia_2: z.string().optional().or(z.literal("")),
  direccion_principal: z.string().optional().or(z.literal("")),
  direccion_ref: z.string().optional().or(z.literal("")),
  distrito: z.string().optional().or(z.literal("")),
  provincia: z.string().optional().or(z.literal("")),
  departamento: z.string().optional().or(z.literal("")),
  brevete_matpel: z.string().optional().or(z.literal("")),
  clase_brev: z.string().optional().or(z.literal("")),
  categoria_brev: z.string().optional().or(z.literal("")),
  institucion_tec_univ: z.string().optional().or(z.literal("")),
  carrera_tec_univ: z.string().optional().or(z.literal("")),
  nivel_alcanzado: z.string().optional().or(z.literal("")),
  grado_obtenido: z.string().optional().or(z.literal("")),
});

export const applicantSchemaUpdate = applicantSchemaCreate.partial();

export type ApplicantSchema = z.infer<typeof applicantSchemaCreate>;

export const applicantStatusSchema = z.object({
  tipo_trabajador_id: requiredId("Seleccione un estado"),
  motivo_status: z.string().optional().or(z.literal("")),
  jefe_id: z.union([z.string(), z.number()]).optional(),
});

export type ApplicantStatusSchema = z.infer<typeof applicantStatusSchema>;
