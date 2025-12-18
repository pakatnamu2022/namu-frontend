import { z } from "zod";

export const hotelAgreementSchemaCreate = z.object({
  city: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Ciudad es requerida",
    }),
  name: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Nombre del hotel es requerido",
    }),
  corporate_rate: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .refine((val) => val > 0, {
      message: "Tarifa corporativa debe ser mayor a 0",
    }),
  features: z.string().max(500).optional().default(""),
  includes_breakfast: z.boolean().optional().default(false),
  includes_lunch: z.boolean().optional().default(false),
  includes_dinner: z.boolean().optional().default(false),
  includes_parking: z.boolean().optional().default(false),
  email: z
    .string()
    .email("Email inválido")
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Email es requerido",
    }),
  phone: z
    .string()
    .max(20)
    .refine((value) => value.trim() !== "", {
      message: "Teléfono es requerido",
    }),
  address: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Dirección es requerida",
    }),
  website: z
    .string()
    .url("URL inválida")
    .max(255)
    .optional()
    .or(z.literal("")),
  active: z.boolean().optional().default(true),
});

export const hotelAgreementSchemaUpdate = hotelAgreementSchemaCreate;

export type HotelAgreementSchema = z.infer<typeof hotelAgreementSchemaCreate>;
export type HotelAgreementSchemaUpdate = z.infer<
  typeof hotelAgreementSchemaUpdate
>;
