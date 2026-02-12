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
    message: "Razon social es requerido",
  }),
  num_doc: z.string().min(1, "El numero de documento es requerido"),
  direction: z.string().min(5, "La direccion es requerida"),
  email: z.email("Email invalido"),
  phone: z.string().regex(/^[0-9]{9}$/, "El telefono debe tener 9 digitos"),
  secondary_email: z
    .email("Email opcional invalido")
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
      // Validacion de longitud de documento segun tipo
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
      // Validacion de prefijo RUC segun tipo de persona
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
      message: "El RUC debe iniciar con 10 (natural) o 20 (juridica).",
      path: ["num_doc"],
    }
  );

export const customersRpSchemaCreate = customersBaseSchema.refine(
  (data) => {
    // Validacion solo para persona juridica (RUC)
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

export const customersRpSchemaUpdate = customersBaseObject
  .partial()
  .refine(
    (data) => {
      // Solo validar si los campos necesarios estan presentes
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
      // Validacion de prefijo RUC segun tipo de persona
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
      message: "El RUC debe iniciar con 10 (natural) o 20 (juridica).",
      path: ["num_doc"],
    }
  );

export type CustomersRpSchema = z.infer<typeof customersRpSchemaCreate>;
