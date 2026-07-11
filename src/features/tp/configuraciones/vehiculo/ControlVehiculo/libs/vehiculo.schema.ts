import { z } from "zod";

const placaSchema = z
    .string()
    .min(3, "La placa debe tener al menos 3 caracteres")
    .max(20, "La placa no puede exceder los 20 caracteres")
    .transform((val) => val.toUpperCase());

const numeroPositivoSchema = z
    .union([z.string(), z.number()])
    .transform((val) => {
        if (typeof val === "string") {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        }
        return val;
    })
    .refine(
        (value) => value === null || value === undefined || value >= 0,
        {
            message: "El valor debe ser mayor o igual a 0",
        }
    );

// Schema base con todos los campos comunes
const vehiculoBaseSchema = z.object({
    tipo_vehiculo_id: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === "string") {
                const parsed = parseInt(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;
        })
        .refine((value) => value > 0, {
            message: "El tipo de vehículo es requerido",
        }),
    placa: placaSchema,
    modelo: z.string().max(100, "El modelo no puede exceder los 100 caracteres").nullable().optional(),
    marca: z.string().max(100, "La marca no puede exceder los 100 caracteres").nullable().optional(),
    serie_chasis: z.string().max(100, "La serie del chasis no puede exceder los 100 caracteres").nullable().optional(),
    motor: z.string().max(100, "El motor no puede exceder los 100 caracteres").nullable().optional(),
    num_mtc: z.string().max(50, "El número MTC no puede exceder los 50 caracteres").nullable().optional(),
    tarjeta_circulacion: z.string().max(50, "La tarjeta de circulación no puede exceder los 50 caracteres").nullable().optional(),
    kilometraje: numeroPositivoSchema.nullable().optional(),
    tercero: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === "string") {
                const parsed = parseInt(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;
        })
        .refine((value) => value === 0 || value === 1, {
            message: "Tercero debe ser 0 (No) o 1 (Sí)",
        })
        .default(0),
    capacidad: numeroPositivoSchema.nullable().optional(),
    capacidad_bruta: numeroPositivoSchema.nullable().optional(),
    reserva: numeroPositivoSchema.nullable().optional(),
    capacidad_util: numeroPositivoSchema.nullable().optional(),
    vehiculo_status: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === "string") {
                const parsed = parseInt(val);
                return isNaN(parsed) ? 1 : parsed;
            }
            return val;
        })
        .refine((value) => value === 0 || value === 1, {
            message: "Estado del vehículo debe ser 0 (Baja) o 1 (Activo)",
        })
        .default(1),
    status_geotab_km: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === "string") {
                const parsed = parseInt(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;
        })
        .refine((value) => value === 0 || value === 1, {
            message: "Status KM debe ser 0 (Manual) o 1 (Automático)",
        })
        .default(0),
    status_matpel: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === "string") {
                const parsed = parseInt(val);
                return isNaN(parsed) ? 1 : parsed;
            }
            return val;
        })
        .refine((value) => value === 0 || value === 1, {
            message: "Status Matpel debe ser 0 (Inactivo) o 1 (Activo)",
        })
        .default(1),
    status_ubicacion: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === "string") {
                const parsed = parseInt(val);
                return isNaN(parsed) ? 1 : parsed;
            }
            return val;
        })
        .refine((value) => value === 0 || value === 1, {
            message: "Status Ubicación debe ser 0 (Inactivo) o 1 (Activo)",
        })
        .default(1),
    sede_id: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === "string") {
                const parsed = parseInt(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;
        })
        .refine((value) => value > 0, {
            message: "La sede es requerida",
        }),
});

export const vehiculoSchemaCreate = vehiculoBaseSchema;

export const vehiculoSchemaUpdate = vehiculoBaseSchema.extend({
    id: z.number().optional(),
    ult_manteniento_realizado: z.string().nullable().optional(),
    km_mantenimiento: numeroPositivoSchema.nullable().optional(),
});

export type VehiculoSchema = z.infer<typeof vehiculoSchemaCreate>;
export type VehiculoSchemaUpdate = z.infer<typeof vehiculoSchemaUpdate>;