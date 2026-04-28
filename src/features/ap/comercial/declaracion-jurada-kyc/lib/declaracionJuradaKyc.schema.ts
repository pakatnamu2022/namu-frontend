import { requiredDate, requiredText } from "@/shared/lib/global.schema";
import { z } from "zod";

const pepRelativeDataSchema = z.object({
  pep_full_name: requiredText("Nombre del PEP es requerido", 2),
  relationship: requiredText("Parentesco es requerido", 2),
});

export const declaracionJuradaKycSchema = z
  .object({
    purchase_request_quote_id: z.string().optional(),
    business_partner_id: z
      .string()
      .min(1, "Cliente es requerido"),
    company_id: z.string().min(1, "Empresa es requerida"),

    occupation: z.string().optional(),
    fixed_phone: z.string().optional(),
    purpose_relationship: z.string().optional(),

    pep_status: z.enum(["SI_SOY", "SI_HE_SIDO", "NO_SOY", "NO_HE_SIDO"], {
      errorMap: () => ({ message: "Estado PEP es requerido" }),
    }),
    pep_collaborator_status: z.enum(
      ["SI_SOY", "SI_HE_SIDO", "NO_SOY", "NO_HE_SIDO"],
      { errorMap: () => ({ message: "Estado PEP colaborador es requerido" }) },
    ),
    pep_position: z.string().optional(),
    pep_institution: z.string().optional(),
    pep_relatives: z.array(z.string()).optional().default([]),
    pep_spouse_name: z.string().optional(),

    is_pep_relative: z.enum(["SI_SOY", "NO_SOY"], {
      errorMap: () => ({ message: "Campo pariente PEP es requerido" }),
    }),
    pep_relative_data: z.array(pepRelativeDataSchema).optional().default([]),

    beneficiary_type: z.enum(
      ["PROPIO", "TERCERO_NATURAL", "PERSONA_JURIDICA", "ENTE_JURIDICO"],
      { errorMap: () => ({ message: "Tipo de beneficiario es requerido" }) },
    ),
    own_funds_origin: z.string().optional(),

    third_full_name: z.string().optional(),
    third_doc_type: z.string().optional(),
    third_doc_number: z.string().optional(),
    third_representation_type: z
      .enum(["ESCRITURA_PUBLICA", "MANDATO", "PODER", "OTROS"])
      .optional(),
    third_pep_status: z
      .enum(["SI_ES", "SI_HA_SIDO", "NO_ES", "NO_HA_SIDO"])
      .optional(),
    third_pep_position: z.string().optional(),
    third_pep_institution: z.string().optional(),
    third_funds_origin: z.string().optional(),

    entity_name: z.string().optional(),
    entity_ruc: z.string().optional(),
    entity_representation_type: z
      .enum(["PODER_POR_ACTA", "ESCRITURA_PUBLICA", "MANDATO"])
      .optional(),
    entity_funds_origin: z.string().optional(),
    entity_final_beneficiary: z.string().optional(),

    declaration_date: requiredDate("Fecha de declaración es requerida"),
    status: z
      .enum(["PENDIENTE", "GENERADO", "FIRMADO"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    const pepActive =
      data.pep_status === "SI_SOY" || data.pep_status === "SI_HE_SIDO";
    if (pepActive && !data.pep_position) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cargo/Posición PEP es requerido",
        path: ["pep_position"],
      });
    }
    if (pepActive && !data.pep_institution) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Institución PEP es requerida",
        path: ["pep_institution"],
      });
    }

    if (
      data.is_pep_relative === "SI_SOY" &&
      (!data.pep_relative_data || data.pep_relative_data.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe agregar al menos un pariente PEP",
        path: ["pep_relative_data"],
      });
    }

    if (data.beneficiary_type === "PROPIO" && !data.own_funds_origin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Origen de fondos propios es requerido",
        path: ["own_funds_origin"],
      });
    }

    if (data.beneficiary_type === "TERCERO_NATURAL") {
      if (!data.third_full_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nombre del tercero es requerido",
          path: ["third_full_name"],
        });
      }
      if (!data.third_funds_origin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Origen de fondos del tercero es requerido",
          path: ["third_funds_origin"],
        });
      }
    }

    const isEntity =
      data.beneficiary_type === "PERSONA_JURIDICA" ||
      data.beneficiary_type === "ENTE_JURIDICO";
    if (isEntity) {
      if (!data.entity_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nombre de la entidad es requerido",
          path: ["entity_name"],
        });
      }
      if (!data.entity_funds_origin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Origen de fondos de la entidad es requerido",
          path: ["entity_funds_origin"],
        });
      }
    }
  });

export const declaracionJuradaKycSchemaUpdate =
  declaracionJuradaKycSchema.partial().extend({
    pep_status: z
      .enum(["SI_SOY", "SI_HE_SIDO", "NO_SOY", "NO_HE_SIDO"])
      .optional(),
    pep_collaborator_status: z
      .enum(["SI_SOY", "SI_HE_SIDO", "NO_SOY", "NO_HE_SIDO"])
      .optional(),
    is_pep_relative: z.enum(["SI_SOY", "NO_SOY"]).optional(),
    beneficiary_type: z
      .enum(["PROPIO", "TERCERO_NATURAL", "PERSONA_JURIDICA", "ENTE_JURIDICO"])
      .optional(),
    declaration_date: requiredDate("Fecha de declaración es requerida"),
  });

export type DeclaracionJuradaKycSchema = z.infer<
  typeof declaracionJuradaKycSchema
>;

export type PepRelativeDataSchema = z.infer<typeof pepRelativeDataSchema>;
