import { z } from "zod";

/**
 * En el formulario NO se carga un precio por carrocería una a una (hay 20+ tipos).
 * Se arman "grupos de precio": un MultiSelectTags con las carrocerías que
 * comparten el mismo monto. Al enviar se aplana a `prices: [{body_type_id, price}]`,
 * que es lo que espera el backend.
 */
export const approvedAccessoryPriceGroupSchema = z.object({
  body_type_ids: z
    .array(z.coerce.number().int().positive())
    .min(1, { message: "Selecciona al menos una carrocería" }),
  price: z.coerce
    .number()
    .min(0, { message: "El precio debe ser mayor o igual a 0" }),
});

export const approvedAccesoriesSchemaCreate = z.object({
  type_operation_id: z.coerce
    .number()
    .min(1, { message: "Tipo de operación es requerido" }),
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  priceGroups: z
    .array(approvedAccessoryPriceGroupSchema)
    .min(1, { message: "Agrega al menos un grupo de precio" })
    .superRefine((groups, ctx) => {
      const seen = new Set<number>();
      groups.forEach((group, groupIndex) => {
        group.body_type_ids.forEach((id) => {
          if (seen.has(id)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [groupIndex, "body_type_ids"],
              message: "Esta carrocería ya está en otro grupo de precio",
            });
          }
          seen.add(id);
        });
      });
    }),
});

export const approvedAccesoriesSchemaUpdate =
  approvedAccesoriesSchemaCreate.partial();

export type ApprovedAccesoriesSchema = z.infer<
  typeof approvedAccesoriesSchemaCreate
>;

export type ApprovedAccessoryPriceGroup = z.infer<
  typeof approvedAccessoryPriceGroupSchema
>;

/** Aplana los grupos de precio al formato que consume el backend. */
export function flattenPriceGroups(
  groups: ApprovedAccessoryPriceGroup[] = [],
): { body_type_id: number; price: number }[] {
  return groups.flatMap((group) =>
    group.body_type_ids.map((body_type_id) => ({
      body_type_id: Number(body_type_id),
      price: Number(group.price),
    })),
  );
}

/** Reagrupa las filas de precio del API por monto para editarlas como grupos. */
export function groupPricesByAmount(
  prices: { body_type_id: number; price: number | string }[] = [],
): ApprovedAccessoryPriceGroup[] {
  const byAmount = new Map<number, number[]>();
  prices.forEach((row) => {
    const amount = Number(row.price);
    const list = byAmount.get(amount) ?? [];
    list.push(Number(row.body_type_id));
    byAmount.set(amount, list);
  });
  return Array.from(byAmount.entries()).map(([price, body_type_ids]) => ({
    price,
    body_type_ids,
  }));
}
