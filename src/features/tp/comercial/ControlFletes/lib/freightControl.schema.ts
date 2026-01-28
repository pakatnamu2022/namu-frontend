import { z } from "zod";

export const freightSchemaCreate = z.object({
    customer: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if(typeof val === 'string'){
                const parsed = parseFloat(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;

        })
        .refine((value) => value > 0, {
            message: "Cliente es necesario"
        }),

    startPoint: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if(typeof val === 'string'){
                const parsed = parseFloat(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;
        })
        .refine((value) => value > 0, {
            message: "Origen es requerido",
        }),

    endPoint: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if(typeof val === 'string'){
                const parsed = parseFloat(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;
        })
        .refine((value) => value > 0, {
            message: "Destino es requerido",
        }),

    freight: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if(typeof val === 'string'){
                const parsed = parseFloat(val);
                return isNaN(parsed) ? 0 : parsed;
            }
            return val;
        })
        .refine((value) => value > 0, {
            message: " Flete debe ser mayor a 0",
        }),

    tipo_flete: z
        .enum(["TONELADAS", "VIAJE", "CAJA", "PALET", "BOLSA"]),
    
});



export const freightSchemaUpdate = freightSchemaCreate.extend({
    id: z.number().optional(),
})
export type FreightSchema = z.infer<typeof freightSchemaCreate>;