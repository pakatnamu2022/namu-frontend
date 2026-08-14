import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const purchaseOrdersSchema = z.object({
  activity_id: z.string().optional(),
  proposal_id: z.string().optional(),
  supplier_id: requiredStringId("El proveedor es requerido"),
  currency_id: requiredStringId("La moneda es requerida"),
  number: z.string().optional(),
  amount: z.coerce
    .number({ error: "El monto es requerido" })
    .min(0, "El monto debe ser mayor o igual a 0"),
  issue_date: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export type PurchaseOrdersSchema = z.infer<typeof purchaseOrdersSchema>;
