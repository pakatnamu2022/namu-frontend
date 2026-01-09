import { optionalStringId, requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

// Schema para Item del Documento
export const ElectronicDocumentItemSchema = z.object({
  reference_document_id: optionalStringId("Documento de referencia inválido"),
  unidad_de_medida: z.string().max(3, "Máximo 3 caracteres"),
  codigo: z.string().max(30, "Máximo 30 caracteres").optional(),
  codigo_producto_sunat: z.string().max(8, "Máximo 8 caracteres").optional(),
  descripcion: z.string().min(1, "Descripción requerida"),
  cantidad: z.number().min(0.0000000001, "La cantidad debe ser mayor a 0"),
  valor_unitario: z.number(),
  precio_unitario: z.number(),
  descuento: z.number().optional(),
  subtotal: z.number(),
  sunat_concept_igv_type_id: z.number({
    error: "Tipo de IGV requerido",
  }),
  igv: z.number(),
  total: z.number(),
  account_plan_id: requiredStringId("Plan contable requerido"),
  anticipo_regularizacion: z.boolean().optional(),
  anticipo_documento_serie: z.string().max(4, "Máximo 4 caracteres").optional(),
  anticipo_documento_numero: z.number().optional(),
});

// Schema para Guía
export const ElectronicDocumentGuideSchema = z.object({
  guia_tipo: z.number({ error: "Tipo de guía requerido" }),
  guia_serie_numero: z.string().max(20, "Máximo 20 caracteres"),
});

// Schema para Cuota
export const ElectronicDocumentInstallmentSchema = z.object({
  cuota: z.number().min(1, "La cuota debe ser al menos 1"),
  fecha_de_pago: z.string(),
  importe: z.number(),
});

// Schema principal del Documento Electrónico
export const ElectronicDocumentSchema = z
  .object({
    // ===== TIPO DE DOCUMENTO Y SERIE =====
    sunat_concept_document_type_id: requiredStringId(
      "Tipo de documento requerido"
    ),
    serie: requiredStringId("Serie requerida"),
    numero: z.string().optional(),

    // ===== TIPO DE OPERACIÓN =====
    sunat_concept_transaction_type_id: requiredStringId(
      "Tipo de operación requerido"
    ),

    // ===== ORIGEN DEL DOCUMENTO =====
    origin_module: z.enum(["comercial", "posventa"], {
      error: "Módulo de origen requerido",
    }),
    origin_entity_type: z.string().optional(),
    origin_entity_id: optionalStringId("Entidad de origen inválida"),
    purchase_request_quote_id: z.string().optional(), // ID de cotización vinculada (módulo comercial)
    order_quotation_id: optionalStringId("ID de cotización de orden inválido"), // ID de cotización de orden (módulo post-venta)
    is_advance_payment: z.boolean().default(false), // Es un pago de anticipo
    ap_vehicle_id: optionalStringId("Vehículo es inválido"), // ID del vehículo vinculado desde la cotización

    // ===== DATOS DEL CLIENTE =====
    client_id: requiredStringId("Cliente requerido"),

    // ===== FECHAS =====
    fecha_de_emision: z.coerce.string(),
    fecha_de_vencimiento: z.string().optional(),

    // ===== MONEDA Y CAMBIO =====
    sunat_concept_currency_id: requiredStringId("Moneda requerida"),
    tipo_de_cambio: z.number().min(0).max(999.999).optional(),

    // ===== TOTALES =====
    descuento_global: z.number().optional(),
    total_descuento: z.number().optional(),
    total_anticipo: z.number().optional(),
    total_gravada: z.number().optional(),
    total_inafecta: z.number().optional(),
    total_exonerada: z.number().optional(),
    total_igv: z.number().optional(),
    total_gratuita: z.number().optional(),
    total_otros_cargos: z.number().optional(),
    total_isc: z.number().optional(),
    total: z.number({ error: "Total requerido" }),

    // ===== PERCEPCIÓN =====
    percepcion_tipo: z.number().min(1).max(3).optional(),
    percepcion_base_imponible: z.number().optional(),
    total_percepcion: z.number().optional(),
    total_incluido_percepcion: z.number().optional(),

    // ===== RETENCIÓN =====
    retencion_tipo: z.number().min(1).max(2).optional(),
    retencion_base_imponible: z.number().optional(),
    total_retencion: z.number().optional(),

    // ===== DETRACCIÓN =====
    detraccion: z.boolean().optional(),
    sunat_concept_detraction_type_id: optionalStringId(
      "Tipo de detracción inválido"
    ),
    detraccion_total: z.number().optional(),
    detraccion_porcentaje: z.number().min(0).max(100).optional(),
    medio_de_pago_detraccion: z.number().min(1).max(12).optional(),

    // ===== NOTAS DE CRÉDITO/DÉBITO =====
    documento_que_se_modifica_tipo: z.number().optional(),
    documento_que_se_modifica_serie: z
      .string()
      .max(4, "Máximo 4 caracteres")
      .optional(),
    documento_que_se_modifica_numero: z.number().optional(),
    sunat_concept_credit_note_type_id: optionalStringId(
      "Tipo de nota de crédito inválido"
    ),
    sunat_concept_debit_note_type_id: optionalStringId(
      "Tipo de nota de débito inválido"
    ),

    // ===== CAMPOS OPCIONALES =====
    observaciones: z.string().max(1000, "Máximo 1000 caracteres").optional(),
    condiciones_de_pago: z.string().min(1, "Condiciones de pago requeridas"),
    medio_de_pago: z.string().min(1, "Medio de pago requerido"),
    bank_id: optionalStringId("Chequera es inválida"),
    operation_number: z
      .string()
      .regex(/^[0-9]*$/, "Número de operación inválido, solo números")
      .max(20, "Máximo 20 caracteres")
      .optional(),
    financing_type: z
      .string()
      .min(1, "Tipo de financiamiento requerido")
      .optional(),
    placa_vehiculo: z.string().max(8, "Máximo 8 caracteres").optional(),
    orden_compra_servicio: z
      .string()
      .max(20, "Máximo 20 caracteres")
      .optional(),
    codigo_unico: z.string().max(20, "Máximo 20 caracteres").optional(),

    // ===== CONFIGURACIÓN =====
    enviar_automaticamente_a_la_sunat: z.boolean().default(false),
    enviar_automaticamente_al_cliente: z.boolean().default(false),
    generado_por_contingencia: z.boolean().optional(),

    // ===== ITEMS (OBLIGATORIOS) =====
    items: z
      .array(ElectronicDocumentItemSchema)
      .min(1, "Debe agregar al menos un item"),

    // ===== GUÍAS (OPCIONALES) =====
    guias: z.array(ElectronicDocumentGuideSchema).optional(),

    // ===== CUOTAS VENTA AL CRÉDITO (OPCIONALES) =====
    venta_al_credito: z.array(ElectronicDocumentInstallmentSchema).optional(),
  })
  .refine(
    (data) => {
      // Validar fecha de vencimiento
      if (data.fecha_de_vencimiento) {
        return (
          new Date(data.fecha_de_vencimiento) > new Date(data.fecha_de_emision)
        );
      }
      return true;
    },
    {
      message:
        "La fecha de vencimiento debe ser posterior a la fecha de emisión",
      path: ["fecha_de_vencimiento"],
    }
  )
  .refine(
    (data) => {
      // Validar detracción
      if (data.detraccion && !data.sunat_concept_detraction_type_id) {
        return false;
      }
      return true;
    },
    {
      message: "Debe especificar el tipo de detracción",
      path: ["sunat_concept_detraction_type_id"],
    }
  )
  .refine(
    (data) => {
      // Validar NC: documento que se modifica
      if ([31].includes(Number(data.sunat_concept_document_type_id))) {
        return !!(
          data.documento_que_se_modifica_tipo &&
          data.documento_que_se_modifica_serie &&
          data.documento_que_se_modifica_numero &&
          data.sunat_concept_credit_note_type_id
        );
      }
      return true;
    },
    {
      message:
        "Debe especificar el documento que se modifica y el tipo de nota de crédito",
      path: ["sunat_concept_credit_note_type_id"],
    }
  )
  .refine(
    (data) => {
      // Validar ND: documento que se modifica
      if ([32].includes(Number(data.sunat_concept_document_type_id))) {
        return !!(
          data.documento_que_se_modifica_tipo &&
          data.documento_que_se_modifica_serie &&
          data.documento_que_se_modifica_numero &&
          data.sunat_concept_debit_note_type_id
        );
      }
      return true;
    },
    {
      message:
        "Debe especificar el documento que se modifica y el tipo de nota de débito",
      path: ["sunat_concept_debit_note_type_id"],
    }
  );

// Schema para Item de Nota de Crédito (similar a ElectronicDocumentItemSchema pero con account_plan_id opcional como number)
export const CreditNoteItemSchema = z.object({
  unidad_de_medida: z.string().max(3, "Máximo 3 caracteres"),
  codigo: z.string().max(30, "Máximo 30 caracteres").nullable().optional(),
  codigo_producto_sunat: z
    .string()
    .max(8, "Máximo 8 caracteres")
    .nullable()
    .optional(),
  descripcion: z.string().min(1, "Descripción requerida"),
  cantidad: z.number().min(0.0000000001, "La cantidad debe ser mayor a 0"),
  valor_unitario: z.number(),
  precio_unitario: z.number(),
  descuento: z.number().nullable().optional(),
  subtotal: z.number(),
  sunat_concept_igv_type_id: z.number({
    error: "Tipo de IGV requerido",
  }),
  igv: z.number(),
  total: z.number(),
  account_plan_id: z.number().nullable().optional(), // number opcional para items de nota de crédito
  reference_document_id: optionalStringId("Documento de referencia inválido"),
  anticipo_regularizacion: z.boolean().nullable().optional(),
  anticipo_documento_serie: z
    .string()
    .max(4, "Máximo 4 caracteres")
    .nullable()
    .optional(),
  anticipo_documento_numero: z.number().nullable().optional(),
});

// Schema para Nota de Crédito
export const CreditNoteSchema = z.object({
  fecha_de_emision: z.coerce.string(),
  sunat_concept_credit_note_type_id: requiredStringId(
    "Tipo de nota de crédito requerido"
  ),
  series: requiredStringId("Serie requerida"),
  observaciones: z
    .string()
    .min(10, "Las observaciones deben tener al menos 10 caracteres"),
  enviar_automaticamente_a_la_sunat: z.boolean().default(false),
  enviar_automaticamente_al_cliente: z.boolean().default(false),
  items: z.array(CreditNoteItemSchema).min(1, "Debe agregar al menos un item"),
});

// Schema para Item de Nota de Débito (igual a CreditNoteItemSchema)
export const DebitNoteItemSchema = z.object({
  unidad_de_medida: z.string().max(3, "Máximo 3 caracteres"),
  codigo: z.string().max(30, "Máximo 30 caracteres").nullable().optional(),
  codigo_producto_sunat: z
    .string()
    .max(8, "Máximo 8 caracteres")
    .nullable()
    .optional(),
  descripcion: z.string().min(1, "Descripción requerida"),
  cantidad: z.number().min(0.0000000001, "La cantidad debe ser mayor a 0"),
  valor_unitario: z.number(),
  precio_unitario: z.number(),
  descuento: z.number().nullable().optional(),
  subtotal: z.number(),
  sunat_concept_igv_type_id: z.number({
    error: "Tipo de IGV requerido",
  }),
  igv: z.number(),
  total: z.number(),
  account_plan_id: z.number().nullable().optional(), // number opcional para items de nota de débito
  reference_document_id: optionalStringId("Documento de referencia inválido"),
  anticipo_regularizacion: z.boolean().nullable().optional(),
  anticipo_documento_serie: z
    .string()
    .max(4, "Máximo 4 caracteres")
    .nullable()
    .optional(),
  anticipo_documento_numero: z.number().nullable().optional(),
});

// Schema para Nota de Débito
export const DebitNoteSchema = z.object({
  sunat_concept_debit_note_type_id: requiredStringId(
    "Tipo de nota de débito requerido"
  ),
  series: requiredStringId("Serie requerida"),
  observaciones: z
    .string()
    .min(10, "Las observaciones deben tener al menos 10 caracteres"),
  enviar_automaticamente_a_la_sunat: z.boolean().default(false),
  enviar_automaticamente_al_cliente: z.boolean().default(false),
  items: z.array(DebitNoteItemSchema).min(1, "Debe agregar al menos un item"),
});

export type ElectronicDocumentSchema = z.infer<typeof ElectronicDocumentSchema>;
export type ElectronicDocumentItemSchema = z.infer<
  typeof ElectronicDocumentItemSchema
>;
export type ElectronicDocumentGuideSchema = z.infer<
  typeof ElectronicDocumentGuideSchema
>;
export type ElectronicDocumentInstallmentSchema = z.infer<
  typeof ElectronicDocumentInstallmentSchema
>;
export type CreditNoteItemSchema = z.infer<typeof CreditNoteItemSchema>;
export type CreditNoteSchema = z.infer<typeof CreditNoteSchema>;
export type DebitNoteItemSchema = z.infer<typeof DebitNoteItemSchema>;
export type DebitNoteSchema = z.infer<typeof DebitNoteSchema>;
