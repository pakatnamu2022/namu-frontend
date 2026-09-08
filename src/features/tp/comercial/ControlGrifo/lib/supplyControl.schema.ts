import { z } from "zod";

export const supplySchemaCreate = z.object({
    vehicle_id: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === 'string') {
                const parsed = parseFloat(val);
                return isNaN(parsed) ? undefined : parsed;
            }
            return val;
        })
        .refine((value) => value === undefined || value > 0, {
            message: "Vehículo es requerido",
        })
        .optional(),

    driver_id: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === 'string') {
                const parsed = parseFloat(val);
                return isNaN(parsed) ? undefined : parsed;
            }
            return val;
        })
        .refine((value) => value === undefined || value > 0, {
            message: "Conductor es requerido",
        })
        .optional(),

    supplier_id: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === 'string') {
                const parsed = parseFloat(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;
        })
        .refine((value) => value > 0, {
            message: "Grifo es requerido",
        }),

    mileage: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === 'string') {
                const parsed = parseFloat(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;
        })
        .refine((value) => value >= 0, {
            message: "Kilometraje debe ser mayor o igual a 0",
        }),

    gallons: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === 'string') {
                const parsed = parseFloat(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;
        })
        .refine((value) => value > 0, {
            message: "Galones debe ser mayor a 0",
        })
        .refine((value) => value <= 999999.999, {
            message: "Galones no puede exceder 999,999.999",
        }),

    is_base: z.boolean().default(true),
    recorded_at: z.string().optional(),
    tank_left_photo: z.string().optional(),
    tank_right_photo: z.string().optional(),
    ticket_photo: z.string().optional(),
    photo: z.string().optional(),
    photo_name: z.string().max(255).optional(),
});

export const supplySchemaUpdate = supplySchemaCreate.partial().extend({
    id: z.number().optional(),
});
export const supplierSchemaCreate = z.object({
    name: z
        .string()
        .min(1, "El nombre del grifo es requerido")
        .max(255, "El nombre no puede exceder 255 caracteres"),

    ruc: z
        .string()
        .max(20, "El RUC no puede exceder 20 caracteres")
        .optional()
        .or(z.literal('')),

    address: z
        .string()
        .max(500, "La dirección no puede exceder 500 caracteres")
        .optional()
        .or(z.literal('')),

    phone: z
        .string()
        .max(50, "El teléfono no puede exceder 50 caracteres")
        .optional()
        .or(z.literal('')),

    is_active: z.boolean().default(true),
});

export const supplierSchemaUpdate = supplierSchemaCreate.partial().extend({
    id: z.number().optional(),
});

export type SupplySchema = z.infer<typeof supplySchemaCreate>;

export type SupplierSchema = z.infer<typeof supplierSchemaCreate>;