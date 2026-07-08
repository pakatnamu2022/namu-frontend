import { z } from "zod";
import { optionalStringId, requiredStringId, requiredDate } from "@/shared/lib/global.schema";

// Schema para Item del Anticipo (subset de ElectronicDocumentItemSchema, sin campos de regularización)
export const RegularizeAdvancePaymentItemSchema = z.object({
  account_plan_id: requiredStringId("Plan contable requerido"),
  unidad_de_medida: z.string().max(3, "Máximo 3 caracteres"),
  codigo: z.string().max(30, "Máximo 30 caracteres").optional(),
  descripcion: z.string().min(1, "Descripción requerida"),
  cantidad: z.number().min(0.0000000001, "La cantidad debe ser mayor a 0"),
  valor_unitario: z.number(),
  precio_unitario: z.number(),
  descuento: z.number().optional(),
  subtotal: z.number(),
  sunat_concept_igv_type_id: z.number({ error: "Tipo de IGV requerido" }),
  igv: z.number(),
  total: z.number(),
});

// Schema para Regularización de Anticipos
// POST /api/ap/facturacion/electronic-documents/regularize-advance-payment
export const RegularizeAdvancePaymentSchema = z.object({
  sunat_concept_document_type_id: requiredStringId("Tipo de documento requerido"),
  series_id: requiredStringId("Serie requerida"),
  numero: z.string().optional(),
  area_id: requiredStringId("Área requerida"),

  client_id: requiredStringId("Cliente requerido"),

  fecha_de_emision: requiredDate("Fecha de emisión requerida"),
  fecha_de_vencimiento: z.string().optional(),

  sunat_concept_currency_id: requiredStringId("Moneda requerida"),

  total_gravada: z.number().optional(),
  total_inafecta: z.number().optional(),
  total_exonerada: z.number().optional(),
  total_igv: z.number().optional(),
  total: z.number({ error: "Total requerido" }).positive("El total debe ser mayor a 0"),

  // Origen: para asociar la cotización de orden (repuestos/mesón) o la orden de trabajo (taller)
  origin_entity_type: z.enum(["ApOrderQuotations", "ApWorkOrder"]).optional(),
  origin_entity_id: optionalStringId("Entidad de origen inválida"),
  order_quotation_id: optionalStringId("Cotización de orden inválida"),
  work_order_id: optionalStringId("Orden de trabajo inválida"),

  observaciones: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  condiciones_de_pago: z.string().optional(),
  medio_de_pago: z.string().optional(),
  bank_id: optionalStringId("Chequera es inválida"),
  operation_number: z
    .string()
    .regex(/^[0-9]*$/, "Número de operación inválido, solo números")
    .max(20, "Máximo 20 caracteres")
    .optional(),
  orden_compra_servicio: z.string().max(20, "Máximo 20 caracteres").optional(),

  items: z
    .array(RegularizeAdvancePaymentItemSchema)
    .min(1, "Debe agregar al menos un item"),
});

export type RegularizeAdvancePaymentSchema = z.infer<
  typeof RegularizeAdvancePaymentSchema
>;
export type RegularizeAdvancePaymentItemSchema = z.infer<
  typeof RegularizeAdvancePaymentItemSchema
>;
