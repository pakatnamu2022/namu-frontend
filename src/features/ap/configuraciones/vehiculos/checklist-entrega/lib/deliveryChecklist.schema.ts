import { z } from "zod";

export const deliveryChecklistSchemaCreate = z.object({
  description: z.string().refine((value) => value.trim() !== "", {
    message: "Descripción es requerido",
  }),
  type: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Tipo es requerido",
    }),
  category_id: z.string().min(1, { message: "Categoría es requerida" }),
  has_quantity: z.boolean().optional().default(false),
  status: z.boolean().optional().default(true),
});

export const deliveryChecklistSchemaUpdate =
  deliveryChecklistSchemaCreate.partial();

export type DeliveryChecklistSchema = z.infer<
  typeof deliveryChecklistSchemaCreate
>;
