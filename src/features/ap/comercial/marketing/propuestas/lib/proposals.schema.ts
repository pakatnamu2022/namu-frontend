import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const proposalsSchema = z.object({
  activity_id: requiredStringId("La actividad es requerida"),
  supplier_id: requiredStringId("El proveedor es requerido"),
  currency_id: requiredStringId("La moneda es requerida"),
  amount: z.coerce
    .number({ error: "El monto es requerido" })
    .min(0, "El monto debe ser mayor o igual a 0"),
  description: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export type ProposalsSchema = z.infer<typeof proposalsSchema>;
