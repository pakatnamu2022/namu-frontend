import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const appointmentPlanningSchemaCreate = z.object({
  description: z
    .string()
    .max(250)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  delivery_date: z.string().refine((value) => value.trim() !== "", {
    message: "Fecha de entrega es requerida",
  }),
  delivery_time: z.string().refine((value) => value.trim() !== "", {
    message: "Hora de entrega es requerida",
  }),
  date_appointment: z.string().refine((value) => value.trim() !== "", {
    message: "Fecha de cita es requerida",
  }),
  time_appointment: z.string().refine((value) => value.trim() !== "", {
    message: "Hora de cita es requerida",
  }),
  full_name_client: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Nombre del cliente es requerido",
    }),
  email_client: z.email({
    message: "Email inválido",
  }),
  phone_client: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Teléfono del cliente es requerido",
    }),
  type_operation_appointment_id: requiredStringId(
    "Tipo de operación de cita es requerido"
  ),
  sede_id: requiredStringId("Sede es requerida"),
  type_planning_id: requiredStringId("Tipo de planificación es requerido"),
  ap_vehicle_id: requiredStringId("Vehículo es requerido"),
});

export const appointmentPlanningSchemaUpdate =
  appointmentPlanningSchemaCreate.partial();

export type AppointmentPlanningSchema = z.infer<
  typeof appointmentPlanningSchemaCreate
>;
