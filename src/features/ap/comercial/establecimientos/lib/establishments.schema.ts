import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const establishmentsSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  description: z.string().optional(),
  type: z.string().min(1, "El tipo es requerido"),
  activity_economic: z.string().optional(),
  address: z.string().min(1, "La dirección es requerida"),
  district_id: requiredStringId("El ubigeo del distrito es requerido"),
  department_id: requiredStringId("El ubigeo del departamento es requerido"),
  province_id: requiredStringId("El ubigeo de la provincia es requerido"),
  location: z.string().optional().nullable(),
  business_partner_id: z.number().min(1, "El ID del cliente es requerido"),
  sede_id: z.string().optional(),
  vincular_sede: z.boolean().optional(),
});

export type EstablishmentsSchema = z.infer<typeof establishmentsSchema>;
