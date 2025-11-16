import { BUSINESS_PARTNERS } from "@/src/core/core.constants";
import {
  optionalStringId,
  requiredStringId,
} from "@/src/shared/lib/global.schema";
import { z } from "zod";

const customersBaseObject = z.object({
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  paternal_surname: z.string().optional(),
  maternal_surname: z.string().optional(),
  full_name: z.string().refine((value) => value.trim() !== "", {
    message: "Razón social es requerido",
  }),
  birth_date: z.union([z.literal(""), z.date()]).optional(),
  nationality: z.string().min(1, "La nacionalidad es requerida"),
  num_doc: z.string().min(1, "El número de documento es requerido"),
  spouse_num_doc: z.string().optional(),
  spouse_full_name: z.string().optional(),
  direction: z.string().min(5, "La dirección es requerida"),
  legal_representative_num_doc: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || val.length === 8,
      "El campo requiere 8 dígitos"
    ),
  legal_representative_name: z.string().optional(),
  legal_representative_paternal_surname: z.string().optional(),
  legal_representative_maternal_surname: z.string().optional(),
  legal_representative_full_name: z.string().optional(),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^[0-9]{9}$/, "El teléfono debe tener 9 dígitos"),
  secondary_email: z
    .string()
    .email("Email opcional inválido")
    .optional()
    .or(z.literal("")),
  secondary_phone: z.string().optional(),
  secondary_phone_contact_name: z.string().optional(),
  driver_num_doc: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || val.length === 8,
      "El campo requiere 8 dígitos"
    ),
  driver_full_name: z.string().optional(),
  driving_license: z.string().optional(),
  driving_license_expiration_date: z
    .union([z.literal(""), z.date()])
    .optional(),
  status_license: z.string().optional(),
  restriction: z.string().optional(),
  origin_id: requiredStringId("El origen es requerido"),
  tax_class_type_id: requiredStringId("La clase de impuesto es requerida"),
  type_person_id: requiredStringId("El tipo de persona es requerido"),
  district_id: requiredStringId("El distrito es requerido"),
  document_type_id: requiredStringId("El tipo de documento es requerido"),
  person_segment_id: requiredStringId("El segmento de persona es requerido"),
  marital_status_id: optionalStringId("El estado civil es requerido"),
  gender_id: optionalStringId("El género es requerido"),
  activity_economic_id: requiredStringId("La actividad económica es requerida"),
  company_id: z.number(),
  type: z.string(),
  company_status: z.string().optional(),
  company_condition: z.string().optional(),
  driving_license_category: z.string().optional(),
  source: z.string().optional(),
});

const customersBaseSchema = customersBaseObject
  .refine(
    (data) => {
      // Validación de longitud de documento según tipo
      if (data.document_type_id === BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID) {
        return data.num_doc.length === 8;
      }
      if (data.document_type_id === BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID) {
        return data.num_doc.length === 11;
      }
      return true;
    },
    {
      message: "",
      path: ["num_doc"],
    }
  )
  .refine(
    (data) => {
      // Validación de prefijo RUC según tipo de persona
      if (data.document_type_id === BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID) {
        if (data.type_person_id === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID) {
          return data.num_doc.startsWith("10");
        }
        if (data.type_person_id === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID) {
          return data.num_doc.startsWith("20");
        }
      }
      return true;
    },
    {
      message: "El RUC debe iniciar con 10 (natural) o 20 (jurídica).",
      path: ["num_doc"],
    }
  );

export const customersSchemaCreate = customersBaseSchema.refine(
  (data) => {
    // Validación solo para persona jurídica (RUC)
    if (data.type_person_id === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID) {
      const status = data.company_status;
      const condition = data.company_condition;

      if (status && condition && status !== "-" && condition !== "-") {
        if (status !== "ACTIVO" || condition !== "HABIDO") {
          return false;
        }
      }
    }
    return true;
  },
  {
    message: "-",
    path: ["company_status"],
  }
);

export const customersSchemaUpdate = customersBaseObject
  .partial()
  .refine(
    (data) => {
      // Solo validar si los campos necesarios están presentes
      if (data.document_type_id && data.num_doc) {
        if (data.document_type_id === BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID) {
          return data.num_doc.length === 8;
        }
        if (data.document_type_id === BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID) {
          return data.num_doc.length === 11;
        }
      }
      return true;
    },
    {
      message: "",
      path: ["num_doc"],
    }
  )
  .refine(
    (data) => {
      // Validación de prefijo RUC según tipo de persona
      if (
        data.document_type_id === BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID &&
        data.num_doc &&
        data.type_person_id
      ) {
        if (data.type_person_id === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID) {
          return data.num_doc.startsWith("10");
        }
        if (data.type_person_id === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID) {
          return data.num_doc.startsWith("20");
        }
      }
      return true;
    },
    {
      message: "El RUC debe iniciar con 10 (natural) o 20 (jurídica).",
      path: ["num_doc"],
    }
  );

export type CustomersSchema = z.infer<typeof customersSchemaCreate>;
