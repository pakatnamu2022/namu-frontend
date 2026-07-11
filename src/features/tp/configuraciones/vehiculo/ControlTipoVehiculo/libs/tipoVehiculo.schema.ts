import { z } from "zod";

export const tipoVehiculoSchemaCreate = z.object({
    descripcion: z
        .string()
        .min(3, "La descripción debe tener al menos 3 caracteres")
        .max(250, "La descripción no puede exceder los 250 caracteres"),
});

export const tipoVehiculoSchemaUpdate = tipoVehiculoSchemaCreate.extend({
    id: z.number().optional(),
});

export type TipoVehiculoSchema = z.infer<typeof tipoVehiculoSchemaCreate>;