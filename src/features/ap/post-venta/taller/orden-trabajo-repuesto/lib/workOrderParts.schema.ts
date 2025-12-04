import { z } from "zod";

export const workOrderPartsSchema = z.object({
  group_number: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Seleccione un grupo")
  ),
  warehouse_id: z.string().min(1, "Seleccione un almacen"),
  product_id: z.string().min(1, "Seleccione un producto"),
  quantity_used: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "La cantidad debe ser mayor a 0")
  ),
});

export type WorkOrderPartsFormData = z.infer<typeof workOrderPartsSchema>;
