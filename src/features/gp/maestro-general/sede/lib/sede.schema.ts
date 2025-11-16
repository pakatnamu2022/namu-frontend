import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const sedeSchemaCreate = z.object({
  suc_abrev: z.string().refine((value) => value.trim() !== "", {
    message: "Nombre es requerido",
  }),
  abreviatura: z.string().refine((value) => value.trim() !== "", {
    message: "Abreviatura es requerido",
  }),
  direccion: z.string().refine((value) => value.trim() !== "", {
    message: "Dirección es requerido",
  }),
  dyn_code: z.string().refine((value) => value.trim() !== "", {
    message: "Cod. Dynamic es requerido",
  }),
  establishment: z.string().refine((value) => value.trim() !== "", {
    message: "Establecimiento es requerido",
  }),
  empresa_id: requiredStringId("Empresa es requerida"),
  district_id: requiredStringId("Distrito es requerido"),
  province_id: requiredStringId("Provincia es requerido"),
  department_id: requiredStringId("Departamento es requerido"),
});

export const sedeSchemaUpdate = sedeSchemaCreate.partial();

export type SedeSchema = z.infer<typeof sedeSchemaCreate>;
