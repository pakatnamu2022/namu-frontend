import { z } from "zod";

export const hotelAgreementSchemaCreate = z.object({
  city: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Ciudad es requerida",
    }),
  ruc: z
    .string()
    .length(11, {
      message: "El RUC debe tener exactamente 11 dígitos",
    })
    .regex(/^\d{11}$/, {
      message: "El RUC debe contener solo números",
    }),
  name: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Nombre del hotel es requerido",
    }),
  corporate_rate: z
    .number({
      error: "Ingrese un número válido",
    })
    .positive({
      message: "Tarifa corporativa debe ser mayor a 0",
    }),
  features: z.string().max(500).optional(),
  includes_breakfast: z.boolean().optional(),
  includes_lunch: z.boolean().optional(),
  includes_dinner: z.boolean().optional(),
  includes_parking: z.boolean().optional(),
  email: z
    .email("Email inválido")
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Email es requerido",
    }),
  phone: z
    .string()
    .max(20, "El teléfono no puede tener más de 20 caracteres")
    .refine((value) => value.trim() !== "", {
      message: "Teléfono es requerido",
    }),
  address: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Dirección es requerida",
    }),
  website: z.string().max(255).optional().or(z.literal("")),
  active: z.boolean().optional(),
});

export const hotelAgreementSchemaUpdate = hotelAgreementSchemaCreate;

export type HotelAgreementSchema = z.infer<typeof hotelAgreementSchemaCreate>;
export type HotelAgreementSchemaUpdate = z.infer<
  typeof hotelAgreementSchemaUpdate
>;
