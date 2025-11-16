import { optionalStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const manageLeadsSchemaCreate = z.object({
  num_doc: z.string().refine((value) => value.trim() !== "", {
    message: "DNI es requerido",
  }),
  name: z.string().refine((value) => value.trim() !== "", {
    message: "Nombres es requerido",
  }),
  surnames: z.string().refine((value) => value.trim() !== "", {
    message: "Apellidos es requerido",
  }),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido"),
  campaign: z.string().refine((value) => value.trim() !== "", {
    message: "Email es requerido",
  }),
  sede_id: optionalStringId("Sede es requerido"),
  vehicle_brand_id: optionalStringId("Marca es requerido"),
  document_type_id: optionalStringId("Tipo de Documento es requerido"),
  type: z.string().refine((value) => value.trim() !== "", {
    message: "Tipo es requerido",
  }),
  income_sector_id: z.string().refine((value) => value.trim() !== "", {
    message: "Ingreso es requerido",
  }),
  area_id: optionalStringId("Área es requerido"),
});

export const manageLeadsSchemaUpdate = manageLeadsSchemaCreate.partial();

export type ManageLeadsSchema = z.infer<typeof manageLeadsSchemaCreate>;
