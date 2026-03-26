import { requiredStringId } from "@/shared/lib/global.schema";
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
  opening_date: z.coerce.date(),
  currency_id: requiredStringId("Moneda es requerida"),
  estimated_delivery_time: z
    .string()
    .min(1, "La fecha y hora de inicio es requerida"),
  diagnosis_date: z
    .union([z.literal(""), z.date()])
    .refine((val) => val !== "", {
      message: "Fecha de diagnóstico es requerida",
    }),
  observations: z.string().max(250),
  items: z
    .array(workOrderItemSchema)
    .min(1, "Debe agregar al menos un trabajo"),
  full_contact_name: z.string().optional(),
  phone_contact: z.string().optional(),
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
