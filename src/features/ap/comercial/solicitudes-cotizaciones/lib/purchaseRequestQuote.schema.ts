import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

const purchaseRequestQuoteSchemaBase = z.object({
  type_document: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Tipo de documento es requerido",
    }),
  warranty: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Garantía es requerido",
    }),
  opportunity_id: requiredStringId("Oportunidad es requerido"),
  comment: z.string().optional().default(""),
  holder_id: requiredStringId("Titular es requerido"),
  with_vin: z.boolean().default(false),
  vehicle_color_id: z.string().optional(),
  ap_models_vn_id: z.string().optional(),
  ap_vehicle_id: z.string().optional(),
  sale_price: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 1;
    },
    {
      message: "El precio de venta debe ser un número mayor a 1",
    }
  ),
  doc_type_currency_id: requiredStringId("Moneda es requerido"),
  sede_id: requiredStringId("Sede es requerido"),
});

export const purchaseRequestQuoteSchemaCreate =
  purchaseRequestQuoteSchemaBase.refine(
    (data) => {
      // Si with_vin es true, vehicle_vn_id es requerido
      if (data.with_vin) {
        return !!data.ap_vehicle_id && data.ap_vehicle_id.trim() !== "";
      }
      // Si with_vin es false, ap_models_vn_id y vehicle_color_id son requeridos
      return (
        !!data.ap_models_vn_id &&
        data.ap_models_vn_id.trim() !== "" &&
        !!data.vehicle_color_id &&
        data.vehicle_color_id.trim() !== ""
      );
    },
    {
      message:
        "Debes seleccionar un vehículo VN o un modelo VN con color según corresponda",
      path: ["with_vin"],
    }
  );

export const purchaseRequestQuoteSchemaUpdate =
  purchaseRequestQuoteSchemaBase.partial();

export type PurchaseRequestQuoteSchema = z.infer<
  typeof purchaseRequestQuoteSchemaCreate
>;
