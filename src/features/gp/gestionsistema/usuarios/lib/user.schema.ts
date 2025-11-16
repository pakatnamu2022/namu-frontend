import {optionalStringId} from "@/src/shared/lib/global.schema";
import {z} from "zod";
import * as LucideIcons from "lucide-react";

const validIconNames = Object.keys(LucideIcons);

export const userSchemaCreate = z.object({
    descripcion: z
        .string()
        .max(255)
        .refine((value) => value.trim() !== "", {
            message: "Descripcion es requerida",
        }),
    submodule: z.boolean().optional(),
    route: z.string().max(255).optional(),
    ruta: z.string().max(255).optional(),
    icono: z.string().max(255).optional(),
    icon: z
        .string()
        .optional()
        .refine((val) => !val || validIconNames.includes(val), {
            message: "El ícono no es válido",
        }),
    parent_id: optionalStringId("Selecciona una vista padre"),
    company_id: optionalStringId("Selecciona una empresa"),
    idPadre: optionalStringId("Selecciona un padre"),
    idSubPadre: optionalStringId("Selecciona un sub padre"),
    idHijo: optionalStringId("Selecciona un hijo"),
});

export const userSchemaUpdate = userSchemaCreate.partial();

export type UserSchema = z.infer<typeof userSchemaCreate>;
