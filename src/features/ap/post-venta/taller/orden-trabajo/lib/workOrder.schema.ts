import { requiredStringId } from "@/shared/lib/global.schema";
import { SERVICE_PDI_ID } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.constants";
import { z } from "zod";

const workOrderItemSchema = z.object({
  group_number: z.number().int().min(1, "Número de grupo debe ser mayor a 0"),
  type_planning_id: requiredStringId("Tipo de planificación es requerido"),
  type_operation_id: requiredStringId("Tipo de operación es requerido"),
  description: z.string().min(0, "Descripción es requerida"),
});

const workOrderSchemaBase = z.object({
  has_appointment: z.boolean().default(false),
  appointment_planning_id: z.string().optional(),
  has_inspection: z.boolean().default(false),
  vehicle_inspection_id: z.string().optional(),
  vehicle_id: requiredStringId("Vehículo es requerido"),
  sede_id: requiredStringId("Sede es requerida"),
  currency_id: requiredStringId("Moneda es requerida"),
  estimated_delivery_time: z
    .string()
    .min(1, "La fecha y hora de inicio es requerida"),
  observations: z.string().max(250),
  items: z
    .array(workOrderItemSchema)
    .min(1, "Debe agregar al menos un trabajo"),
  num_doc_contact: z
    .string()
    .regex(/^[0-9]{8}$/, "El documento debe tener exactamente 8 dígitos")
    .optional()
    .or(z.literal("")),
  full_contact_name: z.string().optional(),
  phone_contact: z
    .string()
    .regex(/^[0-9]{9}$/, "El teléfono debe tener 9 dígitos")
    .optional()
    .or(z.literal("")),
  num_doc_pickup: z
    .string()
    .regex(/^[0-9]{8}$/, "El documento debe tener exactamente 8 dígitos")
    .optional()
    .or(z.literal("")),
  full_pickup_name: z.string().optional(),
  phone_pickup: z
    .string()
    .regex(/^[0-9]{9}$/, "El teléfono debe tener 9 dígitos")
    .optional()
    .or(z.literal("")),
  is_guarantee: z.boolean().default(false),
  is_recall: z.boolean().default(false),
  description_recall: z.string().max(500).optional(),
  type_recall: z.enum(["ROJO", "AMARILLO", "VERDE"]).optional(),
});

const recallRefine = (
  data: {
    is_recall?: boolean;
    type_recall?: string;
    description_recall?: string;
  },
  ctx: z.RefinementCtx,
) => {
  if (data.is_recall) {
    if (!data.type_recall) {
      ctx.addIssue({
        code: "custom",
        message: "Tipo recall es requerido cuando recall está activo",
        path: ["type_recall"],
      });
    }
    if (
      !data.description_recall ||
      data.description_recall.trim().length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Descripción recall es requerida cuando recall está activo",
        path: ["description_recall"],
      });
    }
  }
};

const appointmentRefine = (data: {
  has_appointment?: boolean;
  appointment_planning_id?: string;
}) => {
  if (data.has_appointment) {
    return (
      !!data.appointment_planning_id && data.appointment_planning_id.length > 0
    );
  }
  return true;
};

const isInternalVnPlanning = (items?: { type_planning_id?: string }[]) =>
  !!items?.length &&
  items.every((item) => item.type_planning_id === SERVICE_PDI_ID.toString());

const contactRefine = (
  data: {
    items?: { type_planning_id?: string }[];
    num_doc_contact?: string;
    phone_contact?: string;
  },
  ctx: z.RefinementCtx,
) => {
  if (isInternalVnPlanning(data.items)) return;

  if (!data.num_doc_contact) {
    ctx.addIssue({
      code: "custom",
      message: "Número de documento es requerido",
      path: ["num_doc_contact"],
    });
  }
  if (!data.phone_contact) {
    ctx.addIssue({
      code: "custom",
      message: "El teléfono es requerido",
      path: ["phone_contact"],
    });
  }
};

const inspectionRefine = (data: {
  has_inspection?: boolean;
  vehicle_inspection_id?: string;
}) => {
  if (data.has_inspection) {
    return (
      !!data.vehicle_inspection_id && data.vehicle_inspection_id.length > 0
    );
  }
  return true;
};

const estimatedDeliveryLeadTimeRefine = (
  data: {
    estimated_delivery_time?: string;
  },
  ctx: z.RefinementCtx,
) => {
  if (!data.estimated_delivery_time) return;

  const estimatedDateTime = new Date(data.estimated_delivery_time);
  if (Number.isNaN(estimatedDateTime.getTime())) return;

  const minimumAllowedDateTime = new Date();
  minimumAllowedDateTime.setMinutes(minimumAllowedDateTime.getMinutes() + 20);

  if (estimatedDateTime < minimumAllowedDateTime) {
    ctx.addIssue({
      code: "custom",
      message:
        "La fecha y hora estimada de entrega debe ser al menos 20 minutos mayor que la hora actual",
      path: ["estimated_delivery_time"],
    });
  }
};

export const workOrderSchemaCreate = workOrderSchemaBase
  .superRefine(recallRefine)
  .superRefine(estimatedDeliveryLeadTimeRefine)
  .superRefine(contactRefine)
  .refine(appointmentRefine, {
    message:
      "Cita de planificación es requerida cuando 'Tiene cita' está activo",
    path: ["appointment_planning_id"],
  })
  .refine(inspectionRefine, {
    message:
      "Recepción de vehículo es requerida cuando 'Tiene recepción' está activo",
    path: ["vehicle_inspection_id"],
  });

export const workOrderSchemaUpdate = workOrderSchemaBase
  .extend({
    items: z.array(workOrderItemSchema).optional(),
  })
  .partial()
  .superRefine(recallRefine)
  .superRefine(contactRefine)
  .refine(appointmentRefine, {
    message:
      "Cita de planificación es requerida cuando 'Tiene cita' está activo",
    path: ["appointment_planning_id"],
  })
  .refine(inspectionRefine, {
    message:
      "Recepción de vehículo es requerida cuando 'Tiene recepción' está activo",
    path: ["vehicle_inspection_id"],
  });

export type WorkOrderSchema = z.infer<typeof workOrderSchemaCreate>;
export type WorkOrderItemSchema = z.infer<typeof workOrderItemSchema>;
