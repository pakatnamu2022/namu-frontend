import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const campaignSchemaCreate = z
  .object({
    area_id: requiredStringId("Área es requerido"),
    code: z
      .string()
      .max(50)
      .refine((value) => value.trim() !== "", {
        message: "Código es requerido",
      }),
    name: z
      .string()
      .max(150)
      .refine((value) => value.trim() !== "", {
        message: "Nombre es requerido",
      }),
    description: z.string().optional(),
    start_date: z.string().refine((value) => value.trim() !== "", {
      message: "Fecha de inicio es requerido",
    }),
    end_date: z.string().refine((value) => value.trim() !== "", {
      message: "Fecha de fin es requerido",
    }),
    discount_type: z.enum(["fixed", "percentage"], {
      error: "Tipo de descuento es requerido",
    }),
    discount_value: z.coerce
      .number({ error: "Valor de descuento es requerido" })
      .min(0, "Valor de descuento debe ser mayor o igual a 0"),
    status: z.boolean().default(true),
  })
  .refine(
    (data) =>
      !data.start_date ||
      !data.end_date ||
      new Date(data.end_date) >= new Date(data.start_date),
    {
      message: "Fecha de fin debe ser mayor o igual a la fecha de inicio",
      path: ["end_date"],
    },
  );

export const campaignSchemaUpdate = z.object({
  area_id: requiredStringId("Área es requerido"),
  code: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  name: z
    .string()
    .max(150)
    .refine((value) => value.trim() !== "", {
      message: "Nombre es requerido",
    }),
  description: z.string().optional(),
  start_date: z.string().refine((value) => value.trim() !== "", {
    message: "Fecha de inicio es requerido",
  }),
  end_date: z.string().refine((value) => value.trim() !== "", {
    message: "Fecha de fin es requerido",
  }),
  discount_type: z.enum(["fixed", "percentage"], {
    error: "Tipo de descuento es requerido",
  }),
  discount_value: z.coerce
    .number({ error: "Valor de descuento es requerido" })
    .min(0, "Valor de descuento debe ser mayor o igual a 0"),
  status: z.boolean().default(true),
});

export type CampaignSchema = z.infer<typeof campaignSchemaCreate>;
