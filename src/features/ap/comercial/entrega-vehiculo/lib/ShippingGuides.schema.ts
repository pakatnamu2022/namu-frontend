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

    // Campos para transporte público (transportista RUC)
    carrier_ruc: z.string().optional(),
    company_name_transport: z.string().optional(),

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
      if (!data.driver_name || data.driver_name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nombre del conductor es obligatorio",
          path: ["driver_name"],
        });
      }

      // Transporte privado - OBLIGATORIO: placa del vehículo
      if (!data.plate || data.plate.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La placa del vehículo es obligatoria para transporte privado",
          path: ["plate"],
        });
      } else if (data.plate.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La placa debe tener al menos 6 caracteres",
          path: ["plate"],
        });
      } else if (data.plate.length > 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La placa no puede exceder 7 caracteres",
          path: ["plate"],
        });
      } else if (!/^[A-Z0-9-]+$/.test(data.plate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La placa solo puede contener letras mayúsculas, números y guiones",
          path: ["plate"],
        });
      }
    } else if (isPublicTransport) {
      // Transporte público - OBLIGATORIO: datos del transportista RUC
      if (!data.carrier_ruc || data.carrier_ruc.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El RUC del transportista es obligatorio y debe tener 11 dígitos",
          path: ["carrier_ruc"],
        });
      }
      if (
        !data.company_name_transport ||
        data.company_name_transport.trim().length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La razón social del transportista es obligatoria",
          path: ["company_name_transport"],
        });
      }

      // Transporte público - OPCIONAL: placa (validar solo si se proporciona)
      if (data.plate && data.plate.trim().length > 0) {
        if (data.plate.length < 6) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La placa debe tener al menos 6 caracteres",
            path: ["plate"],
          });
        } else if (data.plate.length > 7) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La placa no puede exceder 7 caracteres",
            path: ["plate"],
          });
        } else if (!/^[A-Z0-9-]+$/.test(data.plate)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "La placa solo puede contener letras mayúsculas, números y guiones",
            path: ["plate"],
          });
        }
      }
    }
  });

export type ShippingGuideSchema = z.infer<typeof shippingGuideSchema>;
