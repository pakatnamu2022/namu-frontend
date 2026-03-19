import { z } from "zod";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

export const shippingGuideSchema = z
  .object({
    // Modalidad de traslado (campo principal)
    transfer_modality_id: z
      .string()
      .min(1, "La modalidad de traslado es requerida"),

    // Campos para transporte privado (conductor)
    driver_doc: z.string().optional(),
    license: z.string().optional(),
    driver_name: z.string().optional(),

    // Campos para transporte público (transportista - selección de proveedor)
    transport_company_id: z.string().optional(),

    // Placa (obligatoria solo para transporte privado)
    plate: z.string().optional(),
    notes: z
      .string()
      .max(255, "Las notas no pueden exceder 255 caracteres")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const isPrivateTransport =
      data.transfer_modality_id ===
      SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PRIVATE;
    const isPublicTransport =
      data.transfer_modality_id ===
      SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PUBLIC;

    if (isPrivateTransport) {
      // Transporte privado - OBLIGATORIO: datos del conductor
      if (!data.driver_doc || data.driver_doc.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El DNI del conductor es obligatorio y debe tener al menos 8 caracteres",
          path: ["driver_doc"],
        });
      }
      if (!data.license || data.license.length < 9) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La licencia de conducir es obligatoria y debe tener al menos 9 caracteres",
          path: ["license"],
        });
      }
      if (data.license && data.license.length > 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La licencia no puede exceder 10 caracteres",
          path: ["license"],
        });
      }

      // Transporte privado - OBLIGATORIO: placa del vehículo
      if (!data.plate || data.plate.replace(/-/g, "").length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La placa del vehículo es obligatoria para transporte privado",
          path: ["plate"],
        });
      } else if (data.plate.replace(/-/g, "").length !== 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La placa debe tener 6 caracteres",
          path: ["plate"],
        });
      } else if (!/^[A-Z0-9]+$/.test(data.plate.replace(/-/g, ""))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La placa solo puede contener letras mayúsculas y números",
          path: ["plate"],
        });
      }
    } else if (isPublicTransport) {
      // Transporte público - OBLIGATORIO: proveedor transportista
      if (!data.transport_company_id || data.transport_company_id.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El transportista es obligatorio para transporte público",
          path: ["transport_company_id"],
        });
      }
    }
  });

export type ShippingGuideSchema = z.infer<typeof shippingGuideSchema>;
