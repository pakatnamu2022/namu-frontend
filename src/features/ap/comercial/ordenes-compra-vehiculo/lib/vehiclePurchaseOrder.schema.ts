import { requiredNumber, requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

// Schema para los items de la orden de compra
export const purchaseOrderItemSchema = z.object({
  unit_measurement_id: requiredStringId("La unidad de medida es requerida"),
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "La descripción es requerida",
    }),
  unit_price: requiredNumber("Precio unitario", 0),
  quantity: z
    .number({
      error: "La cantidad es requerida",
    })
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser al menos 1"),
  is_vehicle: z.boolean().optional().default(false),
});

// Schema base con campos comunes
const basePurchaseOrderSchema = z.object({
  // Invoice information (Cabecera)
  invoice_series: z
    .string()
    .max(10, "La serie no puede tener más de 10 caracteres")
    .refine((value) => value.trim() !== "", {
      message: "Serie de factura es requerida",
    }),
  invoice_number: z
    .string()
    .max(20, "El número no puede tener más de 20 caracteres")
    .refine((value) => value.trim() !== "", {
      message: "Número de factura es requerido",
    }),
  emission_date: z.date({
    error: "La fecha de emisión es requerida",
  }),
  due_date: z
    .date({
      error: "La fecha de vencimiento debe ser una fecha válida",
    })
    .optional(),

  // Valores de la Factura (vienen de la factura física, NO se calculan)
  subtotal: requiredNumber("Subtotal", 0),
  igv: requiredNumber("IGV", 0),
  total: requiredNumber("Total", 0),
  discount: z
    .number({
      error: "El descuento debe ser un número válido",
    })
    .min(0, "El descuento no puede ser negativo")
    .optional(),
  isc: z
    .number({
      error: "El ISC debe ser un número válido",
    })
    .min(0, "El ISC no puede ser negativo")
    .optional(),

  // Relaciones
  supplier_id: requiredStringId("El proveedor es requerido"),
  currency_id: requiredStringId("La moneda es requerida"),
  warehouse_id: requiredStringId("El almacén es requerido"),

  // Items de la Orden de Compra
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, "Debe agregar al menos un item a la orden de compra"),
});

// Schema base sin el refine para poder usar .partial()
const vehiclePurchaseOrderSchemaBase = basePurchaseOrderSchema.extend({
  // Vehicle information - REQUERIDOS cuando isVehiclePurchase = true
  vin: z
    .string()
    .max(17, "El VIN no puede tener más de 17 caracteres")
    .refine((value) => value.trim() !== "", {
      message: "VIN es requerido",
    }),
  year: z
    .number({
      error: "El año del vehículo es requerido",
    })
    .int("El año debe ser un número entero")
    .min(1900, "El año no puede ser menor a 1900")
    .max(2100, "El año no puede ser mayor a 2100"),
  engine_number: z
    .string()
    .max(30, "El número de motor no puede tener más de 30 caracteres")
    .refine((value) => value.trim() !== "", {
      message: "Número de motor es requerido",
    }),
  vehicle_unit_price: requiredNumber("Precio unitario del vehículo", 0),
  ap_brand_id: requiredStringId("La marca es requerida"),
  ap_models_vn_id: requiredStringId("El modelo es requerido"),
  vehicle_color_id: requiredStringId("El color es requerido"),
  supplier_order_type_id: requiredStringId("El tipo de orden es requerido"),
  engine_type_id: requiredStringId("El tipo de motor es requerido"),
  sede_id: requiredStringId("La sede es requerida"),
});

// Schema cuando ES compra de vehículo (con validación de fechas)
export const vehiclePurchaseOrderSchemaCreate =
  vehiclePurchaseOrderSchemaBase.refine(
    (data) => {
      // Si due_date existe, debe ser >= emission_date
      if (data.due_date && data.emission_date) {
        return data.due_date >= data.emission_date;
      }
      return true;
    },
    {
      message:
        "La fecha de vencimiento debe ser igual o posterior a la fecha de emisión",
      path: ["due_date"],
    }
  );

// Schema base genérico sin el refine
const genericPurchaseOrderSchemaBase = basePurchaseOrderSchema.extend({
  // Vehicle information - OPCIONALES cuando isVehiclePurchase = false
  vin: z
    .string()
    .max(17, "El VIN no puede tener más de 17 caracteres")
    .optional()
    .or(z.literal("")),
  year: z
    .number({
      error: "El año del vehículo debe ser un número válido",
    })
    .int("El año debe ser un número entero")
    .min(1900, "El año no puede ser menor a 1900")
    .max(2100, "El año no puede ser mayor a 2100")
    .optional(),
  engine_number: z
    .string()
    .max(30, "El número de motor no puede tener más de 30 caracteres")
    .optional()
    .or(z.literal("")),
  vehicle_unit_price: z
    .number({
      error: "El precio unitario debe ser un número válido",
    })
    .min(0, "El precio unitario no puede ser negativo")
    .optional(),
  ap_models_vn_id: z.string().optional().or(z.literal("")),
  vehicle_color_id: z.string().optional().or(z.literal("")),
  supplier_order_type_id: z.string().optional().or(z.literal("")),
  engine_type_id: z.string().optional().or(z.literal("")),
  sede_id: z.string().optional().or(z.literal("")),
});

// Schema cuando NO ES compra de vehículo (con validación de fechas)
export const genericPurchaseOrderSchemaCreate =
  genericPurchaseOrderSchemaBase.refine(
    (data) => {
      // Si due_date existe, debe ser >= emission_date
      if (data.due_date && data.emission_date) {
        return data.due_date >= data.emission_date;
      }
      return true;
    },
    {
      message:
        "La fecha de vencimiento debe ser igual o posterior a la fecha de emisión",
      path: ["due_date"],
    }
  );

// Para update usamos los schemas base sin refine, y luego aplicamos partial
export const vehiclePurchaseOrderSchemaUpdate =
  vehiclePurchaseOrderSchemaBase.partial();

export const genericPurchaseOrderSchemaUpdate =
  genericPurchaseOrderSchemaBase.partial();

export type VehiclePurchaseOrderSchema = z.infer<
  typeof vehiclePurchaseOrderSchemaCreate
>;

export type GenericPurchaseOrderSchema = z.infer<
  typeof genericPurchaseOrderSchemaCreate
>;

export type PurchaseOrderItemSchema = z.infer<typeof purchaseOrderItemSchema>;
