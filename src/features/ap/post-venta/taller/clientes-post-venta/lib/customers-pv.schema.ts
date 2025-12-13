import { BUSINESS_PARTNERS } from "@/core/core.constants";
import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

const customersBaseObject = z.object({
  nationality: z.string().min(1, "La nacionalidad es requerida"),
  tax_class_type_id: requiredStringId("La clase de impuesto es requerida"),
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  paternal_surname: z.string().optional(),
  maternal_surname: z.string().optional(),
  full_name: z.string().refine((value) => value.trim() !== "", {
    message: "Razón social es requerido",
  }),
  num_doc: z.string().min(1, "El número de documento es requerido"),
  direction: z.string().min(5, "La dirección es requerida"),
  email: z.email("Email inválido"),
  phone: z.string().regex(/^[0-9]{9}$/, "El teléfono debe tener 9 dígitos"),
  secondary_email: z
    .email("Email opcional inválido")
    .optional()
    .or(z.literal("")),
  secondary_phone: z.string().optional(),
  secondary_phone_contact_name: z.string().optional(),
  type_person_id: requiredStringId("El tipo de persona es requerido"),

  district_id: requiredStringId("El distrito es requerido"),
  document_type_id: requiredStringId("El tipo de documento es requerido"),
  company_id: z.number(),
  type: z.string(),
  company_status: z.string().optional(),
  company_condition: z.string().optional(),
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

export const customersPvSchemaCreate = customersBaseSchema.refine(
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

export const customersPvSchemaUpdate = customersBaseObject
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

export type CustomersPvSchema = z.infer<typeof customersPvSchemaCreate>;
