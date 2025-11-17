import { z } from "zod";

export const equipmentSchemaCreate = z.object({
  tipo_equipo_id: z.string().min(1, "Selecciona un tipo de equipo"),
  marca: z.string().max(100).or(z.literal("")),
  modelo: z.string().max(100).or(z.literal("")),
  serie: z.string().max(255).or(z.literal("")),
  detalle: z.string().max(500).optional().or(z.literal("")),
  ram: z.string().max(50).optional().or(z.literal("")),
  almacenamiento: z.string().max(50).optional().or(z.literal("")),
  procesador: z.string().max(100).optional().or(z.literal("")),
  stock_actual: z.number().int().min(0),
  estado_uso: z.enum(["NUEVO", "USADO"]),
  sede_id: z.string().min(1, "Selecciona una sede"),
  pertenece_sede: z.boolean().default(false),
  fecha_adquisicion: z.coerce.date().optional(),
  fecha_garantia: z.coerce.date().optional(),
  tipo_adquisicion: z.string().max(50).optional().or(z.literal("")),
  factura: z.string().max(255).optional().or(z.literal("")),
  contrato: z.string().max(255).optional().or(z.literal("")),
  proveedor: z.string().max(255).optional().or(z.literal("")),
});

export const equipmentSchemaUpdate = equipmentSchemaCreate.partial();

export type EquipmentSchema = z.infer<typeof equipmentSchemaCreate>;
