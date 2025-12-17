import { optionalStringId, requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";
import { CM_COMERCIAL_ID } from "@/core/core.constants";

export const modelsVnSchemaCreate = z
  .object({
    code: z
      .string()
      .max(50)
      .refine((value) => value.trim() !== "", {
        message: "Código es requerido",
      }),
    version: z
      .string()
      .max(50)
      .refine((value) => value.trim() !== "", {
        message: "Versión es requerido",
      }),
    power: z.string().max(50).default("0"),
    model_year: z.coerce
      .number({
        error: "El año del modelo es requerido",
      })
      .int("El año debe ser un número entero")
      .min(1900, "El año no puede ser menor a 1900")
      .max(
        new Date().getFullYear() + 500,
        `El año no puede ser mayor a ${new Date().getFullYear() + 500}`
      ),
    wheelbase: z.string().max(50).default("0"),
    axles_number: z.string().max(50).default("0"),
    width: z.string().max(50).default("0"),
    length: z.string().max(50).default("0"),
    height: z.string().max(50).default("0"),
    seats_number: z.string().max(50).default("0"),
    doors_number: z
      .string()
      .max(50)
      .refine((value) => value.trim() !== "", {
        message: "Número de puertas es requerida",
      }),
    net_weight: z.string().max(50).default("0"),
    gross_weight: z.string().max(50).default("0"),
    payload: z.string().max(50).default("0"),
    displacement: z.string().max(50).default("0"),
    cylinders_number: z.string().max(50).default("0"),
    passengers_number: z
      .string()
      .max(50)
      .refine((value) => value.trim() !== "", {
        message: "Número de pasajeros es requerido",
      }),
    wheels_number: z
      .string()
      .max(50)
      .refine((value) => value.trim() !== "", {
        message: "Número de ruedas es requerido",
      }),
    distributor_price: z.coerce.number().optional(),
    transport_cost: z.coerce.number().optional(),
    other_amounts: z.coerce.number().optional(),
    purchase_discount: z.coerce.number().optional(),
    igv_amount: z.coerce.number().optional(),
    total_purchase_excl_igv: z.coerce.number().optional(),
    total_purchase_incl_igv: z.coerce.number().optional(),
    sale_price: z.coerce.number().optional(),
    margin: z.coerce.number().optional(),
    brand_id: requiredStringId("Marca es requerida"),
    family_id: requiredStringId("Familia es requerida"),
    class_id: requiredStringId("Clase de artículo es requerida"),
    fuel_id: requiredStringId("Tipo combustible es requerida"),
    vehicle_type_id: requiredStringId("Tipo de vehículo es requerida"),
    body_type_id: requiredStringId("Tipo carrocería es requerida"),
    traction_type_id: requiredStringId("Tipo tracción es requerida"),
    transmission_id: requiredStringId("Tipo transmisión es requerida"),
    currency_type_id: optionalStringId("Selecciona un tipo de moneda"),
    type_operation_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Solo validar estos campos si es Comercial
    if (data.type_operation_id === String(CM_COMERCIAL_ID)) {
      if (!data.power || data.power.trim() === "" || data.power === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Potencia es requerido",
          path: ["power"],
        });
      }
      if (!data.wheelbase || data.wheelbase.trim() === "" || data.wheelbase === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Distancia de ejes es requerido",
          path: ["wheelbase"],
        });
      }
      if (!data.axles_number || data.axles_number.trim() === "" || data.axles_number === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de ejes es requerido",
          path: ["axles_number"],
        });
      }
      if (!data.width || data.width.trim() === "" || data.width === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ancho es requerido",
          path: ["width"],
        });
      }
      if (!data.length || data.length.trim() === "" || data.length === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Largo es requerido",
          path: ["length"],
        });
      }
      if (!data.height || data.height.trim() === "" || data.height === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Altura es requerido",
          path: ["height"],
        });
      }
      if (!data.seats_number || data.seats_number.trim() === "" || data.seats_number === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de asientos es requerido",
          path: ["seats_number"],
        });
      }
      if (!data.net_weight || data.net_weight.trim() === "" || data.net_weight === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Peso neto es requerida",
          path: ["net_weight"],
        });
      }
      if (!data.gross_weight || data.gross_weight.trim() === "" || data.gross_weight === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Peso bruto es requerida",
          path: ["gross_weight"],
        });
      }
      if (!data.payload || data.payload.trim() === "" || data.payload === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Carga útil es requerida",
          path: ["payload"],
        });
      }
      if (!data.displacement || data.displacement.trim() === "" || data.displacement === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cilindrada es requerido",
          path: ["displacement"],
        });
      }
      if (!data.cylinders_number || data.cylinders_number.trim() === "" || data.cylinders_number === "0") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de cilindros es requerido",
          path: ["cylinders_number"],
        });
      }
    }
  });

export const modelsVnSchemaUpdate = modelsVnSchemaCreate.partial();

export type ModelsVnSchema = z.infer<typeof modelsVnSchemaCreate>;
